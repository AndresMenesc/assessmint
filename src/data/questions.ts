
import { Question, Section, SubSection } from "../types/assessment";

export const questions: Question[] = [
  // ESTEEM - Section 1A: Insecure Tendencies
  {
    id: "E1A1",
    text: "The individual frequently second-guesses their decisions even after they've been made.",
    section: Section.ESTEEM,
    subSection: SubSection.INSECURE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "E1A2",
    text: "The individual needs reassurance from others before feeling confident in their work.",
    section: Section.ESTEEM,
    subSection: SubSection.INSECURE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "E1A3",
    text: "The individual downplays their achievements when receiving recognition.",
    section: Section.ESTEEM,
    subSection: SubSection.INSECURE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "E1A4",
    text: "The individual feels comfortable asserting their expertise in areas where they have significant knowledge.",
    section: Section.ESTEEM,
    subSection: SubSection.INSECURE,
    isReversed: true,
    negativeScore: true
  },
  {
    id: "E1A5",
    text: "The individual worries about how others perceive their capabilities.",
    section: Section.ESTEEM,
    subSection: SubSection.INSECURE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "E1A6",
    text: "The individual apologizes excessively, even for minor issues or non-mistakes.",
    section: Section.ESTEEM,
    subSection: SubSection.INSECURE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "E1A7",
    text: "The individual accepts constructive criticism without taking it as a personal failure.",
    section: Section.ESTEEM,
    subSection: SubSection.INSECURE,
    isReversed: true,
    negativeScore: true
  },
  
  // ESTEEM - Section 1B: Pride Tendencies
  {
    id: "E1B1",
    text: "The individual confidently highlights their accomplishments when appropriate.",
    section: Section.ESTEEM,
    subSection: SubSection.PRIDE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "E1B2",
    text: "The individual trusts their judgment even when others disagree.",
    section: Section.ESTEEM,
    subSection: SubSection.PRIDE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "E1B3",
    text: "The individual maintains their position when they believe they are correct.",
    section: Section.ESTEEM,
    subSection: SubSection.PRIDE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "E1B4",
    text: "The individual frequently doubts their capabilities when faced with challenges.",
    section: Section.ESTEEM,
    subSection: SubSection.PRIDE,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "E1B5",
    text: "The individual asserts their expertise in areas where they have significant knowledge.",
    section: Section.ESTEEM,
    subSection: SubSection.PRIDE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "E1B6",
    text: "The individual is comfortable advocating for recognition when they've made valuable contributions.",
    section: Section.ESTEEM,
    subSection: SubSection.PRIDE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "E1B7",
    text: "The individual hesitates to take credit for successful outcomes they helped create.",
    section: Section.ESTEEM,
    subSection: SubSection.PRIDE,
    isReversed: true,
    negativeScore: false
  },
  
  // TRUST - Section 2A: Trusting Tendencies
  {
    id: "T2A1",
    text: "The individual readily incorporates suggestions from colleagues into their work.",
    section: Section.TRUST,
    subSection: SubSection.TRUSTING,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "T2A2",
    text: "The individual assumes positive intentions when receiving feedback or criticism.",
    section: Section.TRUST,
    subSection: SubSection.TRUSTING,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "T2A3",
    text: "The individual is comfortable delegating important tasks to others.",
    section: Section.TRUST,
    subSection: SubSection.TRUSTING,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "T2A4",
    text: "The individual prefers to verify information through multiple sources before accepting it.",
    section: Section.TRUST,
    subSection: SubSection.TRUSTING,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "T2A5",
    text: "The individual values input from diverse perspectives when making decisions.",
    section: Section.TRUST,
    subSection: SubSection.TRUSTING,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "T2A6",
    text: "The individual gives others the benefit of the doubt in ambiguous situations.",
    section: Section.TRUST,
    subSection: SubSection.TRUSTING,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "T2A7",
    text: "The individual struggles to relinquish control over projects they're involved with.",
    section: Section.TRUST,
    subSection: SubSection.TRUSTING,
    isReversed: true,
    negativeScore: false
  },
  
  // TRUST - Section 2B: Cautious Tendencies
  {
    id: "T2B1",
    text: "The individual carefully evaluates the credibility of information sources before accepting them.",
    section: Section.TRUST,
    subSection: SubSection.CAUTIOUS,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "T2B2",
    text: "The individual is typically skeptical when presented with new ideas or claims.",
    section: Section.TRUST,
    subSection: SubSection.CAUTIOUS,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "T2B3",
    text: "The individual prefers to rely on their own analysis rather than others' conclusions.",
    section: Section.TRUST,
    subSection: SubSection.CAUTIOUS,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "T2B4",
    text: "The individual accepts information at face value without questioning underlying assumptions.",
    section: Section.TRUST,
    subSection: SubSection.CAUTIOUS,
    isReversed: true,
    negativeScore: true
  },
  {
    id: "T2B5",
    text: "The individual scrutinizes motives when others offer suggestions that affect their work.",
    section: Section.TRUST,
    subSection: SubSection.CAUTIOUS,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "T2B6",
    text: "The individual takes time to independently verify information.",
    section: Section.TRUST,
    subSection: SubSection.CAUTIOUS,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "T2B7",
    text: "The individual feels uncomfortable questioning the reliability of information provided by authority figures.",
    section: Section.TRUST,
    subSection: SubSection.CAUTIOUS,
    isReversed: true,
    negativeScore: true
  },
  
  // DRIVER - Section 3A: Reserved Business Approach
  {
    id: "D3A1",
    text: "The individual prefers letting their work quality speak for itself rather than actively promoting achievements.",
    section: Section.DRIVER,
    subSection: SubSection.RESERVED,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "D3A2",
    text: "The individual feels uncomfortable discussing sales opportunities with potential clients or partners.",
    section: Section.DRIVER,
    subSection: SubSection.RESERVED,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "D3A3",
    text: "The individual regularly shares practice accomplishments on social media and in professional networks.",
    section: Section.DRIVER,
    subSection: SubSection.RESERVED,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "D3A4",
    text: "The individual waits for clients to approach them rather than proactively seeking new business.",
    section: Section.DRIVER,
    subSection: SubSection.RESERVED,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "D3A5",
    text: "The individual hesitates to implement promotional campaigns for their practice or services.",
    section: Section.DRIVER,
    subSection: SubSection.RESERVED,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "D3A6",
    text: "The individual prefers gradual, organic growth over aggressive expansion strategies.",
    section: Section.DRIVER,
    subSection: SubSection.RESERVED,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "D3A7",
    text: "The individual actively pursues community engagements and industry visibility opportunities.",
    section: Section.DRIVER,
    subSection: SubSection.RESERVED,
    isReversed: true,
    negativeScore: false
  },
  
  // DRIVER - Section 3B: Business Hustle
  {
    id: "D3B1",
    text: "The individual actively networks to build referral relationships with other professionals.",
    section: Section.DRIVER,
    subSection: SubSection.HUSTLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "D3B2",
    text: "The individual feels its more appropriate for clients to request additional services rather than proactively recommending them.",
    section: Section.DRIVER,
    subSection: SubSection.HUSTLE,
    isReversed: true,
    negativeScore: true
  },
  {
    id: "D3B3",
    text: "The individual invests personal time in business development activities outside regular hours.",
    section: Section.DRIVER,
    subSection: SubSection.HUSTLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "D3B4",
    text: "The individual consistently follows up with potential clients or business opportunities.",
    section: Section.DRIVER,
    subSection: SubSection.HUSTLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "D3B5",
    text: "The individual hesitates to make cold calls or empower their team to do direct outreach to potential clients/partners.",
    section: Section.DRIVER,
    subSection: SubSection.HUSTLE,
    isReversed: true,
    negativeScore: true
  },
  {
    id: "D3B6",
    text: "The individual proactively identifies and pursues practice growth opportunities.",
    section: Section.DRIVER,
    subSection: SubSection.HUSTLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "D3B7",
    text: "The individual is uncomfortable discussing the practice's competitive advantages with potential clients and team members.",
    section: Section.DRIVER,
    subSection: SubSection.HUSTLE,
    isReversed: true,
    negativeScore: true
  },
  
  // ADAPTABILITY - Section 4A: Precise Tendencies
  {
    id: "A4A1",
    text: "The individual follows established processes and procedures precisely.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.PRECISE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "A4A2",
    text: "The individual pays close attention to details in their work.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.PRECISE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "A4A3",
    text: "The individual creates detailed plans before starting new tasks or projects.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.PRECISE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "A4A4",
    text: "The individual double-checks their work for errors or inconsistencies.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.PRECISE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "A4A5",
    text: "The individual maintains thorough documentation of their work and decisions.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.PRECISE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "A4A6",
    text: "The individual analyzes information systematically before making decisions.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.PRECISE,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "A4A7",
    text: "The individual regularly miss deadlines or arrives late to meetings.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.PRECISE,
    isReversed: true,
    negativeScore: false
  },
  
  // ADAPTABILITY - Section 4B: Flexible Tendencies
  {
    id: "A4B1",
    text: "The individual focuses on big-picture concepts rather than details in their work.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.FLEXIBLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "A4B2",
    text: "The individual is comfortable diving into new tasks without extensive planning.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.FLEXIBLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "A4B3",
    text: "The individual moves forward confidently with 'good enough' rather than perfect.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.FLEXIBLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "A4B4",
    text: "The individual prefers guidelines over rigid rules and procedures.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.FLEXIBLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "A4B5",
    text: "The individual trusts their intuition when making decisions.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.FLEXIBLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "A4B6",
    text: "The individual adjust schedules and timelines as circumstances change.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.FLEXIBLE,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "A4B7",
    text: "The individual feels uncomfortable when plans or processes change unexpectedly.",
    section: Section.ADAPTABILITY,
    subSection: SubSection.FLEXIBLE,
    isReversed: true,
    negativeScore: true
  },
  
  // PROBLEM RESOLUTION - Section 5A: Direct Approach
  {
    id: "PR5A1",
    text: "The individual addresses practice problems as soon as they become apparent.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.DIRECT,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "PR5A2",
    text: "The individual willingly initiates difficult conversations about performance or compliance issues.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.DIRECT,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "PR5A3",
    text: "The individual tends to avoid confronting team members about problematic behaviors.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.DIRECT,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "PR5A4",
    text: "The individual directly addresses client complaints rather than hoping they'll resolve themselves.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.DIRECT,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "PR5A5",
    text: "The individual takes ownership of mistakes and immediately works toward solutions.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.DIRECT,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "PR5A6",
    text: "The individual hesitates to bring potential issues to leadership's attention.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.DIRECT,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "PR5A7",
    text: "The individual communicates bad news or difficult information promptly and clearly.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.DIRECT,
    isReversed: false,
    negativeScore: false
  },
  
  // PROBLEM RESOLUTION - Section 5B: Avoidant Tendencies
  {
    id: "PR5B1",
    text: "The individual hopes minor issues will resolve themselves without intervention.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.AVOIDANT,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "PR5B2",
    text: "The individual frames problems as temporary inconveniences rather than systemic issues.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.AVOIDANT,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "PR5B3",
    text: "The individual directly confronts emerging problems before they escalate.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.AVOIDANT,
    isReversed: true,
    negativeScore: true
  },
  {
    id: "PR5B4",
    text: "The individual redirects conversations when sensitive practice issues arise.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.AVOIDANT,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "PR5B5",
    text: "The individual finds reasons to delay addressing performance problems with team members.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.AVOIDANT,
    isReversed: false,
    negativeScore: true
  },
  {
    id: "PR5B6",
    text: "The individual takes immediate ownership when mistakes or problems occur.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.AVOIDANT,
    isReversed: true,
    negativeScore: true
  },
  {
    id: "PR5B7",
    text: "The individual minimizes the significance of recurring problems.",
    section: Section.PROBLEM_RESOLUTION,
    subSection: SubSection.AVOIDANT,
    isReversed: false,
    negativeScore: true
  },
  
  // COACHABILITY - Section 6
  {
    id: "C6A1",
    text: "The individual actively seeks feedback about their performance and implementation of suggested changes.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "C6A2",
    text: "The individual regularly asks questions to clarify expectations and improve understanding.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "C6A3",
    text: "The individual appears reluctant to try new approaches that are outside their comfort zone.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "C6A4",
    text: "The individual acknowledges mistakes and uses them as learning opportunities.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "C6A5",
    text: "The individual implements suggested changes in behavior or approach when given feedback.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "C6A6",
    text: "The individual appears open to different perspectives, especially from those with different backgrounds or expertise.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "C6A7",
    text: "The individual becomes defensive in response to suggestions the differ from their own.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "C6A8",
    text: "The individual is willing to experiment with new behaviors based on suggestions from others.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: false,
    negativeScore: false
  },
  {
    id: "C6A9",
    text: "The individual is dismissive of feedback that doesn't align with their own self-perception.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: true,
    negativeScore: false
  },
  {
    id: "C6A10",
    text: "The individual avoids asking for help, even when it would benefit their performance.",
    section: Section.COACHABILITY,
    subSection: SubSection.COACHABILITY,
    isReversed: true,
    negativeScore: false
  }
];

export function getShuffledQuestions(): Question[] {
  const questionsCopy = [...questions];
  // Fisher-Yates shuffle algorithm
  for (let i = questionsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
  }
  return questionsCopy;
}
