import { AiProviderOption } from '../types/parking';

export const AI_PROVIDERS: AiProviderOption[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    model: 'gemini-3.6-flash',
    vendor: 'Google',
  },
  {
    id: 'nemotron-ultra',
    name: 'NVIDIA Nemotron Ultra',
    model: 'nvidia/nemotron-3-ultra-550b-a55b',
    vendor: 'NVIDIA',
  },
  {
    id: 'nemotron-super',
    name: 'NVIDIA Nemotron Super',
    model: 'nvidia/nemotron-3-super-120b-a12b',
    vendor: 'NVIDIA',
  },
  {
    id: 'nemotron-49b',
    name: 'NVIDIA Nemotron 49B',
    model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    vendor: 'NVIDIA',
  },
  {
    id: 'nemotron-nano',
    name: 'NVIDIA Nemotron Nano',
    model: 'nvidia/nemotron-3-nano-30b-a3b',
    vendor: 'NVIDIA',
  },
  {
    id: 'gemma-4',
    name: 'Google Gemma 4',
    model: 'google/gemma-4-31b-it',
    vendor: 'Google',
  },
  {
    id: 'gpt-oss',
    name: 'OpenAI GPT-OSS',
    model: 'openai/gpt-oss-120b',
    vendor: 'OpenAI',
  },
];
