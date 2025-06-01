import SupabaseService from "../service/supabase";
import type { Cover ,typeProject ,typeTag} from "../type";
export const fetchingCover = async (): Promise<{
  sorted: Cover[];
  maxId: number;
}> => {
  const supabase = SupabaseService.getClient();
  const { data, error } = await supabase
    .from("cover")
    .select(`id,pic,position,project(project,tag)`);
  if (error) {
    console.log(error.message);
    return { sorted: [], maxId: 0 };
  }
  const fixedData: Cover[] = data.map((item) => {
    const { data: publicURLData } = supabase.storage
      .from("cover")
      .getPublicUrl(item.pic);
    console.log(item.project);
    return {
      ...item,
      id: `${item.id}`,
      pic: item.pic==="./haerin.jpg"?"./haerin.jpg":publicURLData.publicUrl,
      project: Array.isArray(item.project) ? item.project[0] : item.project,
    };
  });
  const sorted = fixedData.sort((a, b) => a.position - b.position);
  const maxId = sorted.reduce((max, cover) => {
    const Id = parseInt(cover.id, 10);
    return Id > max ? Id : max;
  }, 0);

  return { sorted, maxId };
};
export const fetchingProject = async()=>{
  const supabase = SupabaseService.getClient();
  const {data,error} = await supabase.from('project').select('id,project');
  if(error){
    console.log(error.message);
    return []
  }
  console.log(data);
  const output:typeProject[] = data.map((item)=>{
    return {
    id:`${item.id}`,
    name:item.project,
  }})
  console.log(output);
  return output;
}
export const fetchingTag = async()=>{
  const supabase =SupabaseService.getClient();
  const {data,error}=await supabase.from('tag').select('id,tag_name');
  if(error){
    console.log(error.message);
    return []
  }
  console.log(data);
  const output:typeTag[] = data.map((item)=>{
    return{
      id:`${item.id}`,
      name:item.tag_name
    }
  })
  console.log(output);
  return output;
}
