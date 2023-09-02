import { fetchUserPosts } from "@/lib/actions/user.actions"
import { redirect } from "next/navigation"
import ThreadCard from "../cards/ThreadCard"

interface Props{
    currentUserId:string,
    accountId:string,
    accountType:string
}

export default async function ThreadsTab({currentUserId,accountId,accountType}:Props) {
    // fetch Profile Threads
    let result = await fetchUserPosts(accountId)
    if(!result) redirect("/")

  return (
    <section className="mt-9 flex flex-col gap-10">
        {result.threads.map((post:any)=>(
           <ThreadCard
           key={post._id}
           id={post._id}
           currentUserId={currentUserId}
           parentId={post?.parentId}
           content={post.text}
           author={accountType==="User" ? {name:result.name,image:result.image,id:result.id} : {name:post.author.name,image:post.author.image,id:post.author.id} } // todo
           community={post.community} // todo
           createdAt={post.createdAt}
           comments={post?.children}
         />
        ))}
    </section>
  )
}