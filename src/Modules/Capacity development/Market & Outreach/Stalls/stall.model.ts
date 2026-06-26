export interface Stall {
  stall_id: number;
  scheme_name: string;
  place: string;
  product_main_type: string;
  product_type: string;
  num_of_buyer: number;
  num_of_product_sold: number;
  num_of_query: number;
  area_in_sq_m: number;
  comments: string;
  image1_name?: string;
  image2_name?: string;
  lat: number;
  lng: number;
}