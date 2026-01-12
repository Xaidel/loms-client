const parseFormativeCourses = (fc_list: string) => {
  let fcs = fc_list
    // split by comma
    .split(",")
    // trim and only include nonempty values
    .reduce((acc, fc) => {
      const fc_trimmed: string = fc.trim();
      if (fc_trimmed) acc.push(fc_trimmed);
      return acc;
    }, [] as string[]);

  return fcs;
};

export default parseFormativeCourses;
