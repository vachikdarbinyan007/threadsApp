"use server";

import { revalidatePath } from "next/cache";
import User from "../modals/user.modal";
import { connectToDB } from "../mongoose";
import Thread from "../modals/thread.modal";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    userId:string,
    username:string,
    name:string,
  image:string,
  bio:string,
  path:string,
}

export async function updateUser({
  userId,
  username,
  name,
  image,
  bio,
  path,
}:Params): Promise<void> {
  connectToDB();
  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/find/update user : ${error.message}`);
  }
}

export async function fetchUser(userId:string) {
    try {
      connectToDB()
      return User
      .findOne({id:userId})
      // .populate({
      //   path:"communities",
      //   model:Community
      // })
    } catch (error:any) {
      throw new Error(`${error.message}`)
    }
}

export async function fetchUserPosts(userId:string){
  try {
    connectToDB()
    // find all threads where the user is the author  
    const threads = await User
                              .findOne({id:userId})
                              .populate({path:"threads",model:Thread,populate:{
                                path:"children",
                                model:Thread,
                                populate:{
                                  path:"author",
                                  model:User,
                                  select:"name image id"
                                }
                              }})
    return threads
  } catch (error:any) {
    throw new Error(`${error.message}`)
  }
}

export async function fetchUsers({userId,searchString="",pageNumber=0,pageSize=30,sortBy="desc"}:{
  userId:string,
  searchString?:string
  pageNumber?:number
  pageSize?:number
  sortBy?:SortOrder
}){
  try {
    connectToDB()
    const skipAmount = (pageNumber-1) * pageSize
    const regex = new RegExp(searchString,"i")
    const query:FilterQuery<typeof User> = {
      id:{$ne:userId}
    }
    if(searchString.trim()!==""){
      query.$or=[
        {username:{$regex:regex}},
        {name:{$regex:regex}},
      ]
    }
    const sortOptions = {createdAt:sortBy}
    const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize)
    const totalUsersCount=await User.countDocuments(query)
    const users = await usersQuery.exec()
    const isNext = totalUsersCount > skipAmount + users.length
    return {users,isNext}
  } catch (error:any) {
    throw new Error(`${error.message}`)
  }
}

export async function getActivity(userId:string){
  try {
    connectToDB()
    // find all threads created by the user
    const userThreads  = await Thread.find({author:userId})
    // collect all the comments ids
    const childThreadIds=userThreads.reduce((acc,userThread)=>{
      return acc.concat(userThread.children)
    },[])
    const replies =await Thread.find({
      _id:{$in:childThreadIds},
      author:{$ne:userId}
    }).populate({path:"author",model:User,select:"name image _id"})
    return replies
  } catch (error:any) {
    throw new Error(`${error.message}`)
  }
}