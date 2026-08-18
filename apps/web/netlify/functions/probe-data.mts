import { parseModelConfig } from '@sc/data';
export default async (): Promise<Response> => new Response(typeof parseModelConfig);
