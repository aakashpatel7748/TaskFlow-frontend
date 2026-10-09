import { getSpaceAllProjectsAPI } from '@/services/opreations/project'
import { Hash, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ApiResponse } from '@/types/ApiResponce'
import { toast } from '../ui/toast'
import { ProjectPayloadInterFace } from '@/types/project'
import PopupModel from '../tasks/PopupModel'
import { CardContent, CardFooter } from '../ui/card'
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TaskStatus, TaskPriority } from '../constant'

const ProjectList = ({ spaceId }: { spaceId: string }) => {
    const [taskPopup, setTaskPopup] = useState<boolean>(false)
    const [projectList, setProjectList] = useState<ProjectPayloadInterFace[]>([])

    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            attachment: "",
            status: "",
            priority: "",
            dueDate: "",
            assignee: "",
        },
    })

    const onSubmit = async (data: any) => {

        console.log("Task Data:", data);
    }

    const getProjectList = async () => {
        const workspaceId = localStorage.getItem("selectedWorkspaceId");
        if (!workspaceId) return;
        try {
            const response = await getSpaceAllProjectsAPI().action(workspaceId, spaceId)
            const fetchedList: ProjectPayloadInterFace[] = response?.data?.data || [];
            setProjectList(fetchedList)
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    }

    useEffect(() => {
        getProjectList()
    }, [spaceId])


    if (projectList.length === 0) {
        return (
            <div className="pl-8 text-[11px] text-slate-500 italic py-1">
                No projects found
            </div>
        );
    }

    return (
        <div className="pl-6 space-y-0.5 border-l border-slate-800/80 ml-4 my-1">
            {projectList.map((proj) => (
                <div
                    key={proj._id}
                    className="flex items-center justify-between px-2.5 py-1 rounded-md text-[11px] text-slate-400 hover:text-violet-300 hover:bg-slate-800/40 transition group"
                >
                    <div className="flex items-center justify-between w-full">
                        <Link href={`/tasks/projects/${proj._id}`} className="flex items-center gap-1.5 flex-1 min-w-0">
                            <Hash className="w-3 h-3 text-slate-600 group-hover:text-violet-400" />
                            <span className="truncate max-w-[110px]">{proj.name}</span>
                        </Link>
                        <Plus onClick={() => setTaskPopup(!taskPopup)} className='max-w-[13px] cursor-pointer' />
                    </div>
                </div>
            ))}

            <PopupModel
                open={taskPopup}
                onOpenChange={setTaskPopup}
                title="Create Task Model"
                description="Create a new task"
                icon={<Sparkles className="w-5 h-5 text-indigo-500" />}
                maxWidth="max-w-xl"
            >
                <div className="space-y-2 ">

                    <CardContent className='space-y-4 text-xs'>
                        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="name"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-title">
                                                    Task Name <span className="text-rose-500">*</span>
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className='input'
                                                    id="form-rhf-demo-title"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder=" Enter Task name"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="attachment"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-attachment">
                                                    Task Attachment
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className='input file:hidden'
                                                    type='file'
                                                    id="form-rhf-demo-attachment"
                                                    aria-invalid={fieldState.invalid}
                                                    value={undefined}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.files?.[0] || null);
                                                    }}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="status"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-status">
                                                    Task Status
                                                </FieldLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="select" id="form-rhf-demo-status">
                                                        <SelectValue placeholder=" Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {TaskStatus.map((item) => (
                                                                <SelectItem key={item.label} value={item.value}>
                                                                    {item.value}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="priority"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-priority">
                                                    Task Priority
                                                </FieldLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="select" id="form-rhf-demo-priority">
                                                        <SelectValue placeholder=" Select Priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {TaskPriority.map((item) => (
                                                                <SelectItem key={item.label} value={item.value}>
                                                                    {item.value}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="dueDate"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-duedate">
                                                    Due Date
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    type="date"
                                                    className='input'
                                                    id="form-rhf-demo-duedate"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="assignee"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-assignee">
                                                    Assignee
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className='input'
                                                    id="form-rhf-demo-assignee"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder=" Enter Assignee"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    name='description'
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='input-label mt-3' htmlFor="form-rhf-demo-description">
                                                Task Description
                                            </FieldLabel>
                                            <Textarea {...field} style={{ width: "98%" }} className='input text-base font-thin' placeholder="Type your message here." id="form-rhf-demo-description" />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                            </FieldGroup>
                        </form>
                    </CardContent>

                    <CardFooter>
                        <Field orientation="horizontal" className='flex aligns-center justify-between bg-pri mt-3'>
                            <Button type="button" variant="outline" onClick={() => form.reset()}>
                                Reset
                            </Button>
                            <Button type="submit" form="form-rhf-demo">
                                Submit
                            </Button>
                        </Field>
                    </CardFooter>

                </div>
            </PopupModel>
        </div>
    )
}

export default ProjectList