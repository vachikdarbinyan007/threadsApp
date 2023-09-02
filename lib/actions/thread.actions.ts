"use server";

import { revalidatePath } from "next/cache";
import Thread from "../modals/thread.modal";
import User from "../modals/user.modal";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });
    // update user model
    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createdThread._id,
      },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
}

export async function fetchThreads({
  pageNumber,
  pageSize,
}: {
  pageNumber: number;
  pageSize: number;
}) {
  try {
    connectToDB();
    // calculate number of threads  to skip
    const skipAmount = (pageNumber - 1) * pageSize;
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });
    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });
    const posts = await postsQuery.exec();
    // skipAmount = übersprungene
    // posts.length= die die wir jetzt haben
    const isNext = totalPostsCount > skipAmount + posts.length;
    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();
    // Populate community
    const thread = Thread.findById(id)
      .populate({ path: "author", model: User, select: "_id id name image" })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (error: any) {
    throw new Error(` error while fetching thread by Id${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    connectToDB();
    // find original thread by id
    const originalThread = await Thread.findById(threadId)
    console.log(originalThread)
    if(!originalThread){
        throw new Error("Thread not found")
    }
    // create a new Thread with comment Text
    const commentThread = new Thread({
        text:commentText,
        author:userId,
        parentId:threadId
    })
    // save the new Thread
    const savedCommentThread = await commentThread.save()
    originalThread.children.push(savedCommentThread._id);
    await originalThread.save()
    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`error while adding comment to thread ${error.message}`);
  }
}