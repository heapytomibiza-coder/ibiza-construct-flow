import { ProjectCalculator } from '@/components/calculator/ProjectCalculator';
import { Helmet } from 'react-helmet-async';

export default function Calculator() {
  return (
    <>
      <Helmet>
        <title>Project Calculator - Estimate Your Renovation Cost</title>
        <meta 
          name="description" 
          content="Get instant cost estimates for your kitchen, bathroom, or home extension. Calculate project costs with our smart renovation calculator." 
        />
      </Helmet>
      <ProjectCalculator />
    </>
  );
}
