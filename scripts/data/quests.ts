import {EstforConstants, NONE} from "@paintswap/estfor-definitions";
import {
  ACTIONCHOICE_COOKING_BLEKK,
  ACTIONCHOICE_CRAFTING_MITHRIL_PICKAXE,
  ACTIONCHOICE_CRAFTING_NATUOW_LEATHER,
  ACTIONCHOICE_FIREMAKING_LOG,
  ACTIONCHOICE_FIREMAKING_OAK,
  ACTIONCHOICE_SMITHING_IRON_BAR,
  ACTIONCHOICE_SMITHING_MITHRIL_ARMOR,
  ACTION_COMBAT_NATUOW,
  ACTION_COMBAT_QUARTZ_EAGLE,
  ACTION_COMBAT_UFFINCH,
  ACTION_FISHING_SKRIMP,
  ACTION_THIEVING_MAN,
  ACTION_WOODCUTTING_WILLOW,
  ADAMANTINE_ORE,
  BARK_CHUNK,
  COAL_ORE,
  COOKED_BLEKK,
  EMERALD,
  IRON_BAR,
  LOG,
  MAGE_BODY,
  MITHRIL_ARMOR,
  MITHRIL_PICKAXE,
  MITHRIL_TASSETS,
  NATUOW_HIDE,
  NATUOW_LEATHER,
  RAW_SKRIMP,
  RUBY,
  RUBY_AMULET,
} from "@paintswap/estfor-definitions/constants";
import {Skill} from "@paintswap/estfor-definitions/types";

export type QuestInput = {
  questId: number;
  dependentQuestId: number;
  actionId1: number;
  actionNum1: number;
  actionId2: number;
  actionNum2: number;
  actionChoiceId: number;
  actionChoiceNum: number;
  skillReward: number;
  skillXPGained: number;
  rewardItemTokenId1: number;
  rewardAmount1: number;
  rewardItemTokenId2: number;
  rewardAmount2: number;
  burnItemTokenId: number;
  burnAmount: number;
  isFullModeOnly: boolean;
  worldLocation: number;
};

export const allQuests: QuestInput[] = [
  {
    questId: EstforConstants.QUEST_BURN_BAN,
    dependentQuestId: 0,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_FIREMAKING_LOG,
    actionChoiceNum: 100,
    skillReward: Skill.NONE,
    skillXPGained: 0,
    rewardItemTokenId1: LOG,
    rewardAmount1: 200,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_NYMPTH_WATCH,
    dependentQuestId: 0,
    actionId1: EstforConstants.ACTION_WOODCUTTING_LOG,
    actionNum1: 1000,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.WOODCUTTING,
    skillXPGained: 250,
    rewardItemTokenId1: IRON_BAR,
    rewardAmount1: 60,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: LOG,
    burnAmount: 1000,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_SUPPLY_RUN,
    dependentQuestId: 0,
    actionId1: ACTION_COMBAT_NATUOW,
    actionNum1: 500,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.DEFENCE,
    skillXPGained: 250,
    rewardItemTokenId1: NATUOW_LEATHER,
    rewardAmount1: 100,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NATUOW_HIDE,
    burnAmount: 500,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_HIDDEN_BOUNTY,
    dependentQuestId: 0,
    actionId1: ACTION_THIEVING_MAN,
    actionNum1: 10,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.THIEVING,
    skillXPGained: 250,
    rewardItemTokenId1: RUBY,
    rewardAmount1: 1,
    rewardItemTokenId2: EMERALD,
    rewardAmount2: 1,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_PURSE_STRINGS, // Special one that just involves buying brush
    dependentQuestId: 0,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.HEALTH,
    skillXPGained: 100,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_ALMS_POOR,
    dependentQuestId: 0,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_COOKING_BLEKK,
    actionChoiceNum: 500,
    skillReward: Skill.NONE,
    skillXPGained: 0,
    rewardItemTokenId1: EstforConstants.SKILL_BOOST,
    rewardAmount1: 3,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: COOKED_BLEKK,
    burnAmount: 500,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_BURNER_WATCH,
    dependentQuestId: EstforConstants.QUEST_BURN_BAN,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_FIREMAKING_LOG,
    actionChoiceNum: 2000,
    skillReward: Skill.FIREMAKING,
    skillXPGained: 250,
    rewardItemTokenId1: EstforConstants.LEAF_FRAGMENTS,
    rewardAmount1: 4,
    rewardItemTokenId2: BARK_CHUNK,
    rewardAmount2: 4,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_TWO_BIRDS,
    dependentQuestId: EstforConstants.QUEST_SUPPLY_RUN,
    actionId1: ACTION_COMBAT_UFFINCH,
    actionNum1: 900,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.MAGIC,
    skillXPGained: 500,
    rewardItemTokenId1: MAGE_BODY,
    rewardAmount1: 1,
    rewardItemTokenId2: RUBY_AMULET,
    rewardAmount2: 1,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_APPRENTICESHIP,
    dependentQuestId: NONE,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_CRAFTING_NATUOW_LEATHER,
    actionChoiceNum: 500,
    skillReward: Skill.CRAFTING,
    skillXPGained: 750,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_TOWN_COOKOUT,
    dependentQuestId: NONE,
    actionId1: ACTION_FISHING_SKRIMP,
    actionNum1: 5000,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.FISHING,
    skillXPGained: 2250,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: RAW_SKRIMP,
    burnAmount: 5000,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_IRON_AGE,
    dependentQuestId: NONE,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_SMITHING_IRON_BAR,
    actionChoiceNum: 7500,
    skillReward: Skill.SMITHING,
    skillXPGained: 1500,
    rewardItemTokenId1: MITHRIL_ARMOR,
    rewardAmount1: 1,
    rewardItemTokenId2: MITHRIL_TASSETS,
    rewardAmount2: 1,
    burnItemTokenId: IRON_BAR,
    burnAmount: 7500,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_CLEAR_SKIES,
    dependentQuestId: EstforConstants.QUEST_TWO_BIRDS,
    actionId1: ACTION_COMBAT_QUARTZ_EAGLE,
    actionNum1: 300,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.HEALTH,
    skillXPGained: 1200,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_MEADERY_MADNESS,
    dependentQuestId: EstforConstants.QUEST_NYMPTH_WATCH,
    actionId1: ACTION_WOODCUTTING_WILLOW,
    actionNum1: 3000,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: NONE,
    actionChoiceNum: 0,
    skillReward: Skill.WOODCUTTING,
    skillXPGained: 1500,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_FOREST_FIRE,
    dependentQuestId: EstforConstants.QUEST_BURNER_WATCH,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_FIREMAKING_OAK,
    actionChoiceNum: 3000,
    skillReward: Skill.FIREMAKING,
    skillXPGained: 1350,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_MITHRIL_MILITIA,
    dependentQuestId: EstforConstants.QUEST_IRON_AGE,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_SMITHING_MITHRIL_ARMOR,
    actionChoiceNum: 25,
    skillReward: Skill.SMITHING,
    skillXPGained: 5000,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: MITHRIL_ARMOR,
    burnAmount: 25,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_MINOR_MINERS,
    dependentQuestId: EstforConstants.QUEST_APPRENTICESHIP,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: ACTIONCHOICE_CRAFTING_MITHRIL_PICKAXE,
    actionChoiceNum: 12,
    skillReward: Skill.CRAFTING,
    skillXPGained: 2000,
    rewardItemTokenId1: ADAMANTINE_ORE,
    rewardAmount1: 150,
    rewardItemTokenId2: COAL_ORE,
    rewardAmount2: 450,
    burnItemTokenId: MITHRIL_PICKAXE,
    burnAmount: 12,
    isFullModeOnly: false,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_SO_FLETCH,
    dependentQuestId: NONE,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_LOG,
    actionChoiceNum: 9600,
    skillReward: Skill.FLETCHING,
    skillXPGained: 250,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: true,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_ENTER_THE_VEIL,
    dependentQuestId: NONE,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_LOG,
    actionChoiceNum: 14400,
    skillReward: Skill.ALCHEMY,
    skillXPGained: 900,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: true,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_FORGE_AHEAD,
    dependentQuestId: NONE,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: EstforConstants.ACTIONCHOICE_FORGING_MERGE_TINY_ELIXIUM,
    actionChoiceNum: 240,
    skillReward: Skill.FORGING,
    skillXPGained: 200,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: true,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_HEART_STRINGS,
    dependentQuestId: EstforConstants.QUEST_SO_FLETCH,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: EstforConstants.ACTIONCHOICE_FLETCHING_IRON_ARROW,
    actionChoiceNum: 7200,
    skillReward: Skill.FLETCHING,
    skillXPGained: 1800,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: true,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_ALCHEMICAL_PROWESS,
    dependentQuestId: EstforConstants.QUEST_ENTER_THE_VEIL,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: EstforConstants.ACTIONCHOICE_ALCHEMY_SHADOW_SCROLL,
    actionChoiceNum: 14400,
    skillReward: Skill.ALCHEMY,
    skillXPGained: 1800,
    rewardItemTokenId1: EstforConstants.BONEMEAL,
    rewardAmount1: 250,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: true,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_NEW_ALCHEMY,
    dependentQuestId: EstforConstants.QUEST_ENTER_THE_VEIL,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: EstforConstants.ACTIONCHOICE_ALCHEMY_IRON_ORE,
    actionChoiceNum: 50,
    skillReward: Skill.ALCHEMY,
    skillXPGained: 1800,
    rewardItemTokenId1: NONE,
    rewardAmount1: 0,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: true,
    worldLocation: 0,
  },
  {
    questId: EstforConstants.QUEST_FLEX_THE_BOW,
    dependentQuestId: EstforConstants.QUEST_HEART_STRINGS,
    actionId1: NONE,
    actionNum1: 0,
    actionId2: NONE,
    actionNum2: 0,
    actionChoiceId: EstforConstants.ACTIONCHOICE_FLETCHING_EXPERT_BOW,
    actionChoiceNum: 1,
    skillReward: Skill.FLETCHING,
    skillXPGained: 500,
    rewardItemTokenId1: EstforConstants.MITHRIL_ARROW,
    rewardAmount1: 250,
    rewardItemTokenId2: NONE,
    rewardAmount2: 0,
    burnItemTokenId: NONE,
    burnAmount: 0,
    isFullModeOnly: true,
    worldLocation: 0,
  },
];

type MinRequirement = {
  skill: Skill;
  xp: number;
};

export type MinRequirementArray = [MinRequirement, MinRequirement, MinRequirement];

export const defaultMinRequirements: [MinRequirement, MinRequirement, MinRequirement] = [
  {skill: Skill.NONE, xp: 0},
  {skill: Skill.NONE, xp: 0},
  {skill: Skill.NONE, xp: 0},
];

export const allQuestsMinRequirements: MinRequirementArray[] = [
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  [
    {skill: Skill.HEALTH, xp: 2939},
    {skill: Skill.NONE, xp: 0},
    {skill: Skill.NONE, xp: 0},
  ],
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
  defaultMinRequirements,
];
