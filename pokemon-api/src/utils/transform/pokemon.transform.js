// src/utils/transform/pokemon.transform.js
// Pure transformation functions — they take raw PokéAPI data and return clean DTOs.
// "Pure" means no side effects, no API calls, no cache reads. Only data shaping.
// This makes them trivially unit testable.

// ── Sprite DTO ─────────────────────────────────────────────

function transformSprites(sprites) {
  return {
    default:      sprites.front_default,
    shiny:        sprites.front_shiny,
    officialArt:  sprites.other?.['official-artwork']?.front_default || null,
    shinyArt:     sprites.other?.['official-artwork']?.front_shiny   || null,
    dreamWorld:   sprites.other?.dream_world?.front_default          || null,
  };
}

// ── Stat DTO ───────────────────────────────────────────────

function transformStats(rawStats) {
  // Also compute the base stat total — commonly asked in interviews/Pokémon contexts
  const stats = rawStats.map(s => ({
    name:    s.stat.name,
    value:   s.base_stat,
    effort:  s.effort,  // EV yield
  }));

  const total = stats.reduce((sum, s) => sum + s.value, 0);
  return { stats, total };
}

// ── Ability DTO ────────────────────────────────────────────

function transformAbilities(rawAbilities) {
  return rawAbilities.map(a => ({
    name:     a.ability.name,
    isHidden: a.is_hidden,
    slot:     a.slot,
  }));
}

// ── Held Items DTO ─────────────────────────────────────────

function transformHeldItems(rawItems) {
  return rawItems.map(item => ({
    name:    item.item.name,
    rarity:  item.version_details.map(v => ({
      game:   v.version.name,
      rarity: v.rarity,
    })),
  }));
}

// ── Species DTO ────────────────────────────────────────────
// Species contains game flavour text — we filter to English and deduplicate

function transformSpecies(raw) {
  // Get unique English flavor text entries
  const seen = new Set();
  const flavorTexts = raw.flavor_text_entries
    .filter(f => f.language.name === 'en')
    .map(f => f.flavor_text.replace(/\n|\f/g, ' ').trim())  // clean whitespace
    .filter(text => {
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    });

  // English genus (e.g. "Seed Pokémon")
  const genus = raw.genera
    .find(g => g.language.name === 'en')?.genus || null;

  return {
    genus,
    habitat:       raw.habitat?.name     || null,
    generation:    raw.generation?.name  || null,
    isLegendary:   raw.is_legendary,
    isMythical:    raw.is_mythical,
    isBaby:        raw.is_baby,
    captureRate:   raw.capture_rate,
    baseHappiness: raw.base_happiness,
    growthRate:    raw.growth_rate?.name || null,
    eggGroups:     raw.egg_groups.map(e => e.name),
    flavorTexts,
    evolutionChainUrl: raw.evolution_chain?.url || null,
  };
}

// ── Full Pokemon Detail DTO ────────────────────────────────
// Composes the smaller transforms into a single rich response shape

function transformPokemonDetail(rawPokemon, rawSpecies) {
  const { stats, total: statTotal } = transformStats(rawPokemon.stats);

  return {
    id:          rawPokemon.id,
    name:        rawPokemon.name,
    height:      rawPokemon.height / 10,  // dm → m
    weight:      rawPokemon.weight / 10,  // hg → kg
    baseExperience: rawPokemon.base_experience,

    sprites:     transformSprites(rawPokemon.sprites),
    types:       rawPokemon.types.map(t => t.type.name),
    abilities:   transformAbilities(rawPokemon.abilities),
    stats,
    statTotal,
    heldItems:   transformHeldItems(rawPokemon.held_items),
    forms:       rawPokemon.forms.map(f => f.name),

    // From species endpoint
    ...transformSpecies(rawSpecies),
  };
}

module.exports = {
  transformSprites,
  transformStats,
  transformAbilities,
  transformHeldItems,
  transformSpecies,
  transformPokemonDetail,
};
