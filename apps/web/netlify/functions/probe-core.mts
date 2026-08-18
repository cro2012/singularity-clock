import { computeModel } from '@sc/core';
export default async (): Promise<Response> => new Response(typeof computeModel);
