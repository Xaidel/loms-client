export function performaceTarget(target: string) {
  if (!target) return { performance_target: null, passing_score: null }
  const matches = target.match(/\d+/g);
  return {
    performance_target: matches?.[0] ? parseInt(matches[0], 10) : null,
    passing_score: matches?.[1] ? parseInt(matches[1], 10) : null
  };
}
