import { Grid } from '@chakra-ui/react';
import ServerSideImage from "~/lib/pages/home/components/ServerSideImage";

export interface InstaPostProps {
  post: any;

}

const InstaPost = (props: InstaPostProps) => {

  return (
    <Grid gap={4}>
      <ServerSideImage src={props.post.id} />
    </Grid>
  );


};

export default InstaPost;
