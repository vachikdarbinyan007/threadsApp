"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { usePathname,useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
// import { updateUser } from "@/lib/actions/user.actions";
import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props{
    threadId:string
    currentUserImg:string
    currentUserId:string
}

export default function Comment({threadId,currentUserImg,currentUserId}:Props) {
    const router = useRouter()
    const pathname = usePathname()
    const form = useForm({
      resolver: zodResolver(CommentValidation),
      defaultValues: {
       thread:"",
       },
    });
    async function onSubmit(values:z.infer<typeof CommentValidation>){
         await addCommentToThread(threadId,values.thread,JSON.parse(currentUserId),pathname)
        form.reset()
        }
  return (
    <div>
        <h1 className="text-white">Comment Form</h1>
        <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="comment-form"
        >
         <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 w-full">
              <FormLabel>
                <Image src={currentUserImg} alt="profile image" width={48} height={48} className="rounded-full object-cover"/>
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  type="text"
                  placeholder="comment..."
                  className="no-focus text-light-1 outline-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="comment-form_btn">Reply</Button>
        </form>
        </Form>
    </div>
  )
}