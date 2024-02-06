
export const ServerSideImage = ({ src, alt, ...rest } : any) => {
  // @ts-ignore
  const host = typeof window !== "undefined" && window.location.hostname.includes( "localhost") ? "http://localhost:3000" : "";
  return (
    <img
      src={host+`/api/cached-image?url=${src}`}
      alt={alt}
      {...rest}
    />
  );
}

export default ServerSideImage;