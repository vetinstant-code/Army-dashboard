/**
 * Map Vet API pets → cattle dashboard row shape (extend as you wire more screens).
 */
(function (global) {
  function petToHerdRow(pet) {
    const id = String(pet.id ?? pet.pet_id ?? "");
    const name = String(pet.name ?? pet.pet_name ?? "Unknown").trim() || "Unknown";
    return {
      id,
      name,
      breed: pet.breed || pet.species || "—",
      age: pet.age != null ? `${pet.age} Years` : "—",
      status: "healthy",
      lastCheck: pet.last_check || pet.updated_at || "—",
      vitals: [],
      history: [],
      resultTitle: "—",
      resultNote: "",
      advice: [],
      reports: [],
      _raw: pet,
    };
  }

  function petsToCattleMap(pets) {
    const map = {};
    for (const pet of pets) {
      const row = petToHerdRow(pet);
      if (row.id) map[row.id] = row;
    }
    return map;
  }

  function kpiFromPets(pets) {
    const n = pets.length;
    return { total: n, healthy: n, atRisk: 0, sick: 0 };
  }

  global.VetApiAdapter = { petToHerdRow, petsToCattleMap, kpiFromPets };
})(window);
