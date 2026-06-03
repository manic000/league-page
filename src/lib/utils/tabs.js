import {leagueID} from '$lib/utils/leagueInfo';

export const tabs = [
    {
        icon: 'home',
        label: 'Home',
        dest: '/',
        key: 'home',
    },
    {
        icon: 'sports',
        label: 'Matchups',
        dest: '/matchups',
        key: 'matchups',
    },
    {
        icon: 'view_comfy',
        label: 'League Info',
        nest: true,
        key: 'league_info',
        children: [
           {
                icon: 'leaderboard',
                label: 'Standings',
                dest: '/standings',
            },
            {
                icon: 'storage',
                label: 'Rosters',
                dest: '/rosters',
            },
            {
                icon: 'swap_horiz',
                label: 'Trades & Waivers',
                dest: '/transactions',
            },
            {
                icon: 'calculate',
                label: 'Trade Calculator',
                dest: '/trade-calculator',
            },
            {
                icon: 'trending_up',
                label: 'Player & Pick Values',
                dest: '/player-pick-values',
            },
            {
                icon: 'groups',
                label: 'Managers',
                dest: '/managers',
            },
            {
                icon: 'local_fire_department',
                label: 'Rivalry',
                dest: '/rivalry',
            },
            {
                icon: 'view_comfy',
                label: 'Drafts',
                dest: '/drafts',
            },
            {
                icon: 'emoji_events',
                label: 'Trophy Room',
                dest: '/awards',
            },
            {
                icon: 'military_tech',
                label: 'Records',
                dest: '/records',
            },
            {
                icon: 'history_edu',
                label: 'Constitution',
                dest: '/dynasty-knowledge-base?article=constitution',
            },
	{
	    icon: 'lightbulb',
	    label: 'Resources',
	    dest: '/resources',
	 },
        ]
       },
     {
            icon: 'sports_football',
            label: 'Go to Sleeper',
            dest: `https://sleeper.com/leagues/${leagueID}`,
    },
];