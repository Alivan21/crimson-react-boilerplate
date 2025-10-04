import { useParams } from "react-router";

export default function Component() {
  const params = useParams();
  return <div>User id: {params.id}</div>;
}
