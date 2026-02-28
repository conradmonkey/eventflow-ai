// Tent sizing calculator based on space per person requirements
const SEATING_SPACE_REQUIREMENTS = {
  presentation: { min: 6, max: 8, label: 'Theater (Chairs Only)' },
  standing: { min: 8, max: 10, label: 'Cocktail (Standing)' },
  seated_dinner: { min: 10, max: 12, label: 'Banquet (Rectangular Tables)' },
  seated_8ft: { min: 10, max: 12, label: 'Banquet (Rectangular Tables)' },
  seated_6ft: { min: 12, max: 15, label: 'Banquet (Round Tables)' },
  seated_5ft: { min: 12, max: 15, label: 'Banquet (Round Tables)' },
  cocktail: { min: 8, max: 10, label: 'Cocktail (Standing)' }
};

// Tent dimensions in square feet
const TENT_SIZES = [
  { type: 'tent_10x10', width: 10, length: 10, sqft: 100 },
  { type: 'tent_10x20', width: 10, length: 20, sqft: 200 },
  { type: 'tent_15x15', width: 15, length: 15, sqft: 225 },
  { type: 'tent_20x20', width: 20, length: 20, sqft: 400 },
  { type: 'tent_20x30', width: 20, length: 30, sqft: 600 },
  { type: 'tent_30x30', width: 30, length: 30, sqft: 900 }
];

export function calculateRequiredSqFt(attendees, seatingArrangement) {
  const requirement = SEATING_SPACE_REQUIREMENTS[seatingArrangement];
  if (!requirement) return null;
  
  // Use average of min/max for calculation
  const spacePerPerson = (requirement.min + requirement.max) / 2;
  return attendees * spacePerPerson;
}

export function suggestTentSize(attendees, seatingArrangement) {
  const requiredSqFt = calculateRequiredSqFt(attendees, seatingArrangement);
  if (!requiredSqFt) return null;

  // Find smallest tent that fits
  const suitable = TENT_SIZES.find(tent => tent.sqft >= requiredSqFt);
  return suitable || TENT_SIZES[TENT_SIZES.length - 1]; // Return largest if nothing fits
}

export function suggestTentCombination(attendees, seatingArrangement) {
  const requiredSqFt = calculateRequiredSqFt(attendees, seatingArrangement);
  if (!requiredSqFt) return null;

  // Try to find a single tent that works
  const singleTent = suggestTentSize(attendees, seatingArrangement);
  
  return {
    recommended: singleTent,
    requiredSqFt: Math.round(requiredSqFt),
    spacePerPerson: SEATING_SPACE_REQUIREMENTS[seatingArrangement]
  };
}