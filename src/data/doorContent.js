// Friendly copy for the door guidance system.
// Keys match the roomId used by the 3D doors and the map.

export const DOOR_INFO = {
    gallery: {
        title: 'PROJECTS',
        description: "Explore the ideas I've transformed into real projects!",
        intro: 'Here are some of the things I have been building.'
    },
    experience: {
        title: 'EXPERIENCE',
        description: 'Curious about my professional journey? Step inside!',
        intro: 'This is where my internships and field work live.'
    },
    about: {
        title: 'ABOUT',
        description: "Discover my story, education and what I've learned along the way.",
        intro: 'A little about me, my studies and my toolkit.'
    },
    rewards: {
        title: 'REWARDS',
        description: "A few moments I'm proud of, and the awards that came with them.",
        intro: 'Awards, hackathons and recognitions.'
    },
    extracurricular: {
        title: 'EXTRACURRICULAR',
        description: 'Leadership, student clubs and life beyond the classroom.',
        intro: 'The communities and initiatives I care about.'
    },
    contact: {
        title: 'CONTACT',
        description: "Have an opportunity or an interesting idea? Let's connect!",
        intro: "Let's talk - I would love to hear from you."
    }
};

// The first stop we recommend to a new visitor (the first door on the left).
export const RECOMMENDED_ROOM = 'gallery';

export const getDoorInfo = (roomId) => DOOR_INFO[roomId] || null;

export const ROOM_ORDER = ['about', 'gallery', 'experience', 'rewards', 'extracurricular', 'contact'];
