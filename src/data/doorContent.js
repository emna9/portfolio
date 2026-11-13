// Friendly copy for the door guidance system.
// Keys match the roomId used by the 3D doors and the map.

export const DOOR_INFO = {
    gallery: {
        title: 'PROJECTS',
        description: "Explore the ideas I've transformed into real projects!",
        intro: 'Here are some of the things I have been building.',
        guide: 'Curious about the projects I have built? This room is for you!'
    },
    experience: {
        title: 'EXPERIENCE',
        description: 'Curious about my professional journey? Step inside!',
        intro: 'This is where my internships and field work live.',
        guide: 'Let me show you my professional journey - the internships and the work behind them.'
    },
    about: {
        title: 'ABOUT',
        description: "Discover my story, education and what I've learned along the way.",
        intro: 'A little about me, my studies and my toolkit.',
        guide: 'Here is a little more about me, my studies and the technologies I enjoy working with.'
    },
    rewards: {
        title: 'REWARDS',
        description: "A few moments I'm proud of, and the awards that came with them.",
        intro: 'Awards, hackathons and recognitions.',
        guide: 'A few award and hackathon moments I am proud of.'
    },
    extracurricular: {
        title: 'EXTRACURRICULAR',
        description: 'Leadership, student clubs and life beyond the classroom.',
        intro: 'The communities and initiatives I care about.',
        guide: 'This is where I share the communities and initiatives I care about beyond class.'
    },
    contact: {
        title: 'CONTACT',
        description: "Have an opportunity or an interesting idea? Let's connect!",
        intro: "Let's talk - I would love to hear from you.",
        guide: 'Have an opportunity or an interesting idea? Let us talk!'
    }
};

// The first stop we recommend to a new visitor (the first door on the left).
export const RECOMMENDED_ROOM = 'gallery';

export const getDoorInfo = (roomId) => DOOR_INFO[roomId] || null;

export const ROOM_ORDER = ['about', 'gallery', 'experience', 'rewards', 'extracurricular', 'contact'];
