'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Briefcase, PlusCircle, Search, Trash2, Eye, User, Users as UsersIcon, MoreHorizontal, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import UserSelect from '@/components/kothakom/UserSelect';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Project = {
  id: string;
  name: string;
  description: string;
  status: 'New' | 'In Progress' | 'Hold' | 'Cancelled' | 'Completed';
  projectType: 'Fixed' | 'Monthly';
  clientId: string;
  budget: number;
  workHours: number;
  startDate: string;
  handoverDate: string;
  managerEmail: string;
  assignedEmails: string[];
  createdAt: string;
};

type Client = {
  id: string;
  name: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

const projectSchema = z.object({
  name: z.string().min(2, "Project title is required"),
  description: z.string().min(5, "Description is required"),
  status: z.enum(["New", "In Progress", "Hold", "Cancelled", "Completed"]),
  projectType: z.enum(["Fixed", "Monthly"]),
  clientId: z.string().min(1, "Please select a client"),
  budget: z.coerce.number().min(0),
  startDate: z.string().min(1, "Start date is required"),
  handoverDate: z.string().min(1, "Handover date is required"),
  managerEmail: z.string().email("Please select a manager"),
  assignedEmails: z.array(z.string().email()).optional(),
});

export default function ProjectsPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const projectsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'projects');
  }, [firestore, user]);

  const clientsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);

  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: projects, isLoading } = useCollection<Project>(
    useMemoFirebase(() => projectsRef ? query(projectsRef, orderBy('createdAt', 'desc')) : null, [projectsRef])
  );
  
  const { data: clients } = useCollection<Client>(clientsRef);
  const { data: users } = useCollection<UserProfile>(usersRef);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { 
      name: '', 
      description: '', 
      status: 'New',
      projectType: 'Fixed',
      clientId: '',
      budget: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      handoverDate: format(new Date(), "yyyy-MM-dd"),
      managerEmail: '',
      assignedEmails: []
    },
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, searchTerm]);

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    if (!projectsRef) return;
    addDocumentNonBlocking(projectsRef, {
      ...values,
      workHours: 0,
      createdAt: new Date().toISOString(),
    });
    toast({ title: "Project Created", description: `${values.name} has been added to portal.` });
    form.reset();
    setIsAddOpen(false);
  }

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'projects', id));
    toast({ title: "Project Deleted", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage deliverables, budgets, and team allocations.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="lg"><PlusCircle className="mr-2 h-5 w-5" /> New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto border-border">
            <DialogHeader>
              <DialogTitle>Initiate New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="clientId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Scope</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="handoverDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Handover Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (Tk)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="projectType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Fixed">Fixed Price</SelectItem>
                          <SelectItem value="Monthly">Monthly Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Hold">Hold</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField control={form.control} name="managerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Manager" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {users?.map(u => <SelectItem key={u.email} value={u.email}>{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="assignedEmails" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Team Members</FormLabel>
                      <FormControl>
                        <UserSelect field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full" size="lg">Create Project Profile</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search projects by title..." 
          className="pl-9 h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-10 text-center animate-pulse">Syncing portfolio...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-lg">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No projects found.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[100px]">Ref</TableHead>
                    <TableHead>Project Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="group">
                      <TableCell className="text-[10px] font-mono font-bold text-muted-foreground">
                        #PRJ-{project.id.slice(-4).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-bold">{project.name}</TableCell>
                      <TableCell>
                         <Badge variant="secondary" className="text-[10px] font-medium">
                            {project.projectType === 'Monthly' ? 'Retainer' : 'Fixed'}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          project.status === 'In Progress' ? 'border-primary text-primary' : 
                          project.status === 'Completed' ? 'border-green-500 text-green-500' : 
                          project.status === 'Cancelled' ? 'border-red-500 text-red-500' : ''
                        }>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">Tk {project.budget?.toLocaleString()}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                        <div className="flex flex-col">
                           <span>Starts: {project.startDate}</span>
                           <span className="font-bold text-foreground">Handover: {project.handoverDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => router.push(`/kothakom/projects/${project.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Portal
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently remove this project profile.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
