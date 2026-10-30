// Shapes a stored college for public display. Partnership shows only when the
// admin has marked it as verified and permitted for public display.
export function publicCollege(c, courseById) {
  return {
    id: c.id,
    name: c.name,
    district: c.district,
    address: c.address || "",
    website: c.website || "",
    description: c.description || "",
    facilities: c.facilities || [],
    feeNote: c.feeNote || "",
    feeVerifiedOn: c.feeVerifiedOn || "",
    partner: Boolean(c.partnership?.mou && c.partnership?.displayPublic),
    courses: (c.courseIds || [])
      .map((id) => courseById.get(id))
      .filter((x) => x && x.active)
      .map((x) => ({ id: x.id, name: x.name, stream: x.stream, degree: x.degree })),
  };
}
