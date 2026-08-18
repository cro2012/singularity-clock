import satori from 'satori';
export default async (): Promise<Response> => new Response(typeof satori);
