
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Logo />
          <Button variant="outline" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
      
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">About ORBIT</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="lead text-xl">
            ORBIT (Owner Readiness & Behavioral Insight Tool) is a comprehensive assessment 
            designed to provide insights into leadership behaviors across five key dimensions.
          </p>
          
          <h2>What ORBIT Measures</h2>
          
          <p>
            The assessment consists of 84 questions that measure your tendencies across 
            five critical leadership dimensions:
          </p>
          
          <ul>
            <li>
              <strong>Esteem</strong> — Your balance between self-doubt and confidence in your abilities and decisions.
            </li>
            <li>
              <strong>Trust</strong> — Your openness to external input versus maintaining independence in decision-making.
            </li>
            <li>
              <strong>Business Drive</strong> — Your approach to business development, from conservative to proactive.
            </li>
            <li>
              <strong>Adaptability</strong> — Your preference for structure and precision versus flexibility and experimentation.
            </li>
            <li>
              <strong>Problem Resolution</strong> — Your style in addressing issues, from direct confrontation to careful avoidance.
            </li>
          </ul>
          
          <p>
            Additionally, ORBIT measures your coachability — your openness to feedback and willingness to implement changes.
          </p>
          
          <h2>Multi-Rater Approach</h2>
          
          <p>
            ORBIT uses a multi-rater approach where:
          </p>
          
          <ul>
            <li>You complete a self-assessment</li>
            <li>Two others who work with you provide anonymous ratings</li>
            <li>The system compares your self-perception with how others see you</li>
          </ul>
          
          <p>
            This comparison creates two powerful metrics:
          </p>
          
          <ul>
            <li>
              <strong>Self-Awareness</strong> — How closely your self-assessment aligns with others' perceptions
            </li>
            <li>
              <strong>Coachability Awareness</strong> — How accurately you assess your own openness to feedback
            </li>
          </ul>
          
          <h2>Leadership Profiles</h2>
          
          <p>
            Based on your scores across all dimensions, ORBIT identifies your leadership profile 
            from ten possible archetypes, each with distinct characteristics and behaviors.
          </p>
          
          <h2>How to Use Your Results</h2>
          
          <p>
            Your ORBIT results provide valuable insights for:
          </p>
          
          <ul>
            <li>Identifying your natural leadership tendencies</li>
            <li>Understanding how others perceive your behaviors</li>
            <li>Recognizing potential blind spots in your self-perception</li>
            <li>Developing strategies for professional growth based on your profile</li>
          </ul>
          
          <div className="mt-8">
            <Button asChild>
              <Link to="/start">Start Your Assessment</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
