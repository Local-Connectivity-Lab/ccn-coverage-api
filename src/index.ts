const w = 'world';

export function hello(world: string = w): string {
  return `Hello ${world}! `;
}
