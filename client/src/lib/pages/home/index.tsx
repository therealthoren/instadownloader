import { Grid } from '@chakra-ui/react';
import {useEffect, useState} from "react";
import {getAllPosts} from "~/lib/api/server";
import InstaPost from "~/lib/pages/home/components/InstaPost";

const Home = () => {
  const [posts, setPosts] = useState([] as any);
  useEffect(() => {
    getAllPosts().then((posts) => {
      setPosts(posts);
    });
  }, []);

  return (
    <Grid gap={4}>
      <h1>Home</h1>
      {posts.map((post: any) => (
        <InstaPost key={post.id} post={post} />
      ))}
    </Grid>
  );
};

export default Home;
