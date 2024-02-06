import {APICore} from "./apiCore";

const api = new APICore();

export const getAllPosts = async () => {
    return api.get('/api/posts')
      .then((response) => {
        return response.data;
      });
}
