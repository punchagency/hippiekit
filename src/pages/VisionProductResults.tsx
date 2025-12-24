import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Leaf,
  Recycle,
  TriangleAlert,
  AlertTriangle,
} from 'lucide-react';
import type { VisionAnalysis } from '@/services/scanService';
import { ProductResultInfoCard } from '@/components/ProductResultInfoCard';
import chemicalsIcon from '@/assets/chemicalsIcon.svg';

const ScoreBadge = ({ label, score }: { label: string; score: number }) => {
  const color =
    score >= 8 ? 'bg-green-600' : score >= 5 ? 'bg-yellow-500' : 'bg-red-600';
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-white text-sm font-semibold px-2 py-1 rounded ${color}`}
      >
        {score}/10
      </span>
    </div>
  );
};

export default function VisionProductResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysis, scannedImage } = (location.state || {}) as {
    analysis: VisionAnalysis;
    scannedImage?: string;
  };

  if (!analysis) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="text-center text-gray-700">
          No analysis data provided.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-[24.5px] pb-6">
      <div className="flex items-center justify-between mb-4 pb-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-primary font-bold text-lg">AI OCR Results</div>
        <div />
      </div>

      {scannedImage ? (
        <div className="mb-4">
          <img src={scannedImage} alt="Scanned" className="w-full rounded-md" />
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div>
          <div className="text-xl font-semibold">
            {analysis.product_info.name || 'Unknown Product'}
          </div>
          <div className="text-gray-600">
            {analysis.product_info.brand || 'Unknown Brand'}
          </div>
          <div className="text-gray-500 text-sm">
            {analysis.product_info.category} • {analysis.product_info.type}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <ScoreBadge
            label="Health"
            score={analysis.health_assessment.score || 0}
          />
          <ScoreBadge label="Eco" score={analysis.eco_assessment.score || 0} />
        </div>

        {/* Chemical Analysis Section */}
        {analysis.chemical_analysis &&
          analysis.chemical_analysis.flags.length > 0 && (
            <div className="mt-4">
              {/* Safety Score Badge */}
              {analysis.chemical_analysis.safety_score !== null && (
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`px-4 py-2 rounded-lg font-bold text-lg ${
                      analysis.chemical_analysis.safety_score >= 70
                        ? 'bg-green-100 text-green-800'
                        : analysis.chemical_analysis.safety_score >= 40
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Safety Score: {analysis.chemical_analysis.safety_score}/100
                  </div>
                  {analysis.chemical_analysis.safety_score < 50 && (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              )}

              <ProductResultInfoCard
                icon={chemicalsIcon}
                title={`${
                  analysis.chemical_analysis.flags.length
                } Harmful Chemical${
                  analysis.chemical_analysis.flags.length > 1 ? 's' : ''
                } Detected`}
                titleType="negative"
                tags={analysis.chemical_analysis.flags.map(
                  (flag) => `${flag.chemical} (${flag.severity})`
                )}
                descTitle="Chemical Red Flags"
                description={analysis.chemical_analysis.flags
                  .map(
                    (flag) =>
                      `⚠️ ${flag.chemical} (${flag.category}): ${flag.why_flagged}`
                  )
                  .join('\n\n')}
              />

              {/* Recommendations Section */}
              {analysis.chemical_analysis.recommendations && (
                <div className="mt-4 space-y-4">
                  {/* What to Avoid */}
                  {analysis.chemical_analysis.recommendations.avoid.length >
                    0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        ❌ What to Avoid
                      </h4>
                      <ul className="space-y-1">
                        {analysis.chemical_analysis.recommendations.avoid.map(
                          (item, idx) => (
                            <li key={idx} className="text-sm text-red-700">
                              • {item}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* What to Look For */}
                  {analysis.chemical_analysis.recommendations.look_for.length >
                    0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        ✅ What to Look For
                      </h4>
                      <ul className="space-y-1">
                        {analysis.chemical_analysis.recommendations.look_for.map(
                          (item, idx) => (
                            <li key={idx} className="text-sm text-green-700">
                              • {item}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Trusted Certifications */}
                  {analysis.chemical_analysis.recommendations.certifications
                    .length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        🏆 Trusted Certifications
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.chemical_analysis.recommendations.certifications.map(
                          (cert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded font-medium"
                            >
                              {cert}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Clean Product Message */}
        {analysis.chemical_analysis &&
          analysis.chemical_analysis.flags.length === 0 && (
            <div className="flex items-center gap-3 text-green-600 p-3 bg-green-50 rounded-lg">
              <Leaf className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">Clean Product ✓</h3>
                <p className="text-sm text-gray-600">
                  No harmful chemicals detected from our database
                </p>
              </div>
            </div>
          )}

        <div>
          <div className="font-semibold mb-1">Visible Text (OCR)</div>
          <div className="text-sm whitespace-pre-wrap text-gray-700">
            {analysis.visible_text || 'Text not readable'}
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1">Ingredients</div>
          <div className="text-sm whitespace-pre-wrap text-gray-700">
            {analysis.ingredients || 'Not visible in image'}
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1 flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 text-red-500" /> Concerning
            Chemicals
          </div>
          <div className="text-sm whitespace-pre-wrap text-gray-700">
            {analysis.concerning_chemicals || 'None visible'}
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1 flex items-center gap-2">
            <Recycle className="w-4 h-4 text-green-600" /> Packaging
          </div>
          <div className="text-sm text-gray-700">
            Material: {analysis.packaging.material}
          </div>
          <div className="text-sm text-gray-700">
            Type: {analysis.packaging.type}
          </div>
          <div className="text-sm text-gray-700">
            Recyclable: {analysis.packaging.recyclable}
          </div>
        </div>

        {analysis.product_info.category?.toLowerCase().includes('food') ||
        analysis.nutrition ? (
          <div>
            <div className="font-semibold mb-1">Nutrition</div>
            <div className="text-sm whitespace-pre-wrap text-gray-700">
              {analysis.nutrition || 'Not visible'}
            </div>
          </div>
        ) : null}

        <div>
          <div className="font-semibold mb-1">Health Assessment</div>
          <div className="text-sm text-gray-700">
            Risk: {analysis.health_assessment.risk_level}
          </div>
          <div className="text-sm text-gray-700">
            Concerns: {analysis.health_assessment.concerns}
          </div>
          <div className="text-sm text-gray-700">
            Benefits: {analysis.health_assessment.benefits}
          </div>
          <div className="text-sm text-gray-700">
            Explanation: {analysis.health_assessment.explanation}
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" /> Environmental Assessment
          </div>
          <div className="text-sm text-gray-700">
            Concerns: {analysis.eco_assessment.concerns}
          </div>
          <div className="text-sm text-gray-700">
            Positives: {analysis.eco_assessment.benefits}
          </div>
          <div className="text-sm text-gray-700">
            Explanation: {analysis.eco_assessment.explanation}
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1">Recommendation</div>
          <div className="text-sm text-gray-700">
            Avoid: {analysis.recommendation.avoid}
          </div>
          <div className="text-sm text-gray-700">
            Reasons: {analysis.recommendation.reasons}
          </div>
          <div className="text-sm text-gray-700">
            Alternatives: {analysis.recommendation.alternatives}
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={() => navigate('/scan')} className="w-full">
            Scan Another
          </Button>
        </div>
      </div>
    </div>
  );
}
