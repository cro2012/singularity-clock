import sharp from 'sharp';
export default async (): Promise<Response> => new Response(typeof sharp);
