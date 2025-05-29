import CommentList from "@/features/comment/CommentList";
import CommentForm from "@/features/comment/CommentForm";
import { useEffect } from "react";
import { useCommentAction } from "../comment/CommentStoreProvider";

function PostCommentSection() {
  const { fetchComments } = useCommentAction();
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <>
      <CommentList />
      <CommentForm />
    </>
  );
}

export default PostCommentSection;
