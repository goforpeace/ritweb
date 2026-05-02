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
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
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
  
  // Lifted state to prevent freezing
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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
    toast({ title: "Project Created" });
    form.reset();
    setIsAddOpen(false);
  }

  const handleDelete = () => {
    if (!firestore || !projectToDelete) return;
    deleteDocumentNonBlocking(doc(firestore, 'projects', projectToDelete));
    toast({ title: "Project Deleted", variant: "destructive" });
    setProjectToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Project Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage deliverables and team allocations.</p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="font-black uppercase tracking-tighter">
            <PlusCircle className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search projects..." 
          className="pl-9 h-12 border-2 focus-visible:ring-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="ink-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center animate-pulse">Syncing portfolio...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <Briefcase className="mx-auto h-8 w-8 mb-4" />
              <p>No projects found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="ink-table-header">
                <TableRow>
                  <TableHead className="w-[100px]">Ref</TableHead>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-[10px] font-mono font-black text-muted-foreground">
                      #PRJ-{project.id.slice(-4).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-bold">{project.name}</TableCell>
                    <TableCell>
                       <Badge variant="secondary" className="text-[9px] font-black uppercase h-5">
                          {project.projectType}
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black uppercase h-5">
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-black text-sm">Tk {project.budget?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase">Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => router.push(`/kothakom/projects/${project.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" /> Open Portal
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                  onSelect={() => setProjectToDelete(project.id)} 
                                  className="text-destructive font-bold"
                              >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lifted Modals */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto border-2 border-black">
            <DialogHeader>
              <DialogTitle className="font-black uppercase">Initiate New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Project Title</FormLabel>
                      <FormControl><Input className="border-2" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="clientId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="border-2"><SelectValue /></SelectTrigger></FormControl>
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
                    <FormLabel className="font-black uppercase text-xs">Scope / Summary</FormLabel>
                    <FormControl><Textarea className="border-2 min-h-[100px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Start Date</FormLabel>
                      <FormControl><Input type="date" className="border-2" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="handoverDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Handover Date</FormLabel>
                      <FormControl><Input type="date" className="border-2" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Budget (Tk)</FormLabel>
                      <FormControl><Input type="number" className="border-2" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="projectType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Revenue</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="border-2"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Fixed">Fixed Price</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="border-2"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Hold">Hold</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField control={form.control} name="managerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-xs">Project Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="border-2"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {users?.map(u => <SelectItem key={u.email} value={u.email}>{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full font-black uppercase h-12">Create Project Profile</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      <AlertDialog open={!!projectToDelete} onOpenChange={(val) => !val && setProjectToDelete(null)}>
          <AlertDialogContent className="border-2 border-black">
              <AlertDialogHeader>
                  <AlertDialogTitle className="font-black uppercase">Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently remove the record.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel className="font-bold">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white font-bold">Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
