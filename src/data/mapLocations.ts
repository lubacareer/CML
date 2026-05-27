import type { MapLocationData } from '../game/types';

export const mapLocations: MapLocationData[] = [
    {
        id: 'detective_agency',
        name: 'Detective Agency Office',
        x: 280,
        y: 80,
        width: 250,
        height: 220,
        initiallyUnlocked: true,
        targetScene: 'office',
        lockedText: 'The agency is right there, which makes it hard to misplace.'
    },
    {
        id: 'cozy_cafe',
        name: "Daisy's Cafe / Street",
        x: 555,
        y: 90,
        width: 280,
        height: 220,
        initiallyUnlocked: true,
        targetScene: 'street',
        lockedText: 'The cafe exterior is available from the street, but the inside still has union rules.'
    },
    {
        id: 'police_kiosk',
        name: 'Police kiosk',
        x: 910,
        y: 105,
        width: 235,
        height: 240,
        requiredFlag: 'police_kiosk_unlocked',
        previewId: 'police-kiosk',
        itemInteractions: {
            invalid_alibi: {
                type: 'effects',
                effects: [
                    { type: 'setFlag', flag: 'police_kiosk_unlocked' },
                    { type: 'setFlag', flag: 'invalid_alibi_delivered' },
                    { type: 'setFlag', flag: 'alley_unlocked' }
                ],
                text: 'Hazel files the Invalid Alibi at the police kiosk. The paperwork panics, approves itself, and unlocks the narrow alley.'
            }
        },
        lockedText: 'The police kiosk is locked behind paperwork. Terrifying paperwork.'
    },
    {
        id: 'oddities_museum',
        name: 'Oddities museum',
        x: 95,
        y: 330,
        width: 285,
        height: 230,
        requiredFlag: 'oddities_museum_unlocked',
        lockedText: 'The museum is closed for an exhibit called Please Stop Touching That.'
    },
    {
        id: 'boarding_house',
        name: 'Boarding house',
        x: 715,
        y: 370,
        width: 315,
        height: 245,
        requiredFlag: 'boarding_house_unlocked',
        lockedText: 'The boarding house will matter once the case has more suspects.'
    },
    {
        id: 'narrow_alley',
        name: 'Narrow alley',
        x: 455,
        y: 455,
        width: 210,
        height: 220,
        requiredFlag: 'alley_unlocked',
        previewId: 'alley',
        lockedText: 'The alley refuses to be investigated before it has a proper clue.'
    },
    {
        id: 'docks',
        name: 'The docks',
        x: 45,
        y: 560,
        width: 310,
        height: 145,
        requiredFlag: 'docks_unlocked',
        lockedText: 'The docks are full of boats, fish, and future sprint work.'
    }
];
