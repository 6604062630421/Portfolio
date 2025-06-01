export type Project = {
  project: string;
  tag: string[];
};
export type Cover = {
  id: string;
  pic: string;
  position: number;
  project: Project;
};