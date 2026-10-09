import { Plus, Sparkles } from 'lucide-react'
import PopupModel from '../tasks/PopupModel'
import { CardContent, CardFooter } from '../ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { ProjectPayloadInterFace } from '@/types/project'
import { Switch } from '../ui/switch'
import { createProjectAPI } from '@/services/opreations/project'
import { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponce'
import { toast } from '../ui/toast'

type Props = {
    spaceId: string;
}

const Project = ({ spaceId }: Props) => {

    const [projectOpenModel, setProjectOpenModel] = useState<boolean>(false)

    const form = useForm<ProjectPayloadInterFace>({
        defaultValues: {
            name: "",
            description: "",
            isPrivate: false,
        },
    })

    // worksapceId
    const workspaceId = localStorage.getItem("selectedWorkspaceId")


    const onSubmit = async (data: ProjectPayloadInterFace) => {
        if (!workspaceId) {
            toast.add({
                title: "Project creation failed",
                description: "Please select a workspace",
            })
            return
        }
        try {
            const dataToSend = {
                ...data,
                workspaceId,
                spaceId
            }
            const responce = await createProjectAPI().action(dataToSend);
            toast.add({
                title: "Space created successfully",
                description: responce?.data?.message,
            });
            setProjectOpenModel(false)
        } catch (error) {
            console.error("Error in creating space", error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMsg = axiosError.response?.data.message;
            toast.add({
                title: "Space creation failed",
                description: errorMsg,
            });
        }
    }

    return (
        <>
            <Plus onClick={() => setProjectOpenModel(!projectOpenModel)} className="w-2 h-2 text-slate-500" />

            <PopupModel
                open={projectOpenModel}
                onOpenChange={() => setProjectOpenModel(false)}
                title="Add New Project"
                description="Configure a new project for your tasks, and team members."
                icon={<Sparkles className="w-5 h-5 text-indigo-500" />}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">

                    <CardContent className='space-y-4 text-xs'>
                        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>

                                <Controller
                                    name="name"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='input-label' htmlFor="form-rhf-demo-title">
                                                Project Name <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                style={{ width: "95%", }}
                                                className='input'
                                                id="form-rhf-demo-title"
                                                aria-invalid={fieldState.invalid}
                                                placeholder=" Enter project name"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name='description'
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='input-label mt-3' htmlFor="form-rhf-demo-title">
                                                Project Discription
                                            </FieldLabel>
                                            <Textarea {...field} style={{ width: "95%", }} className='input text-base font-thin  ' placeholder="Type your message here." />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}

                                />

                                <Controller
                                    name='isPrivate'
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field orientation="horizontal" data-invalid={fieldState.invalid} style={{ borderRadius: "10px", width: "96%" }} className="flex items-center justify-between  mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                                            <FieldLabel className='text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none m-0' htmlFor="switch-focus-mode">
                                                Make project private to workspace members
                                            </FieldLabel>
                                            <Switch
                                                checked={field.value}
                                                id="switch-focus-mode"
                                                onCheckedChange={field.onChange}
                                            />
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
        </>

    )
}

export default Project