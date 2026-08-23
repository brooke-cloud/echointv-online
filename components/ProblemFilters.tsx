type ProblemFiltersProps = {
  companies: string[];
  difficulties: string[];
  stages?: string[];
  categories: string[];

  selectedCompany: string;
  selectedDifficulty: string;
  selectedStage?: string;
  selectedCategory: string;

  onCompanyChange: (company: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onStageChange?: (stage: string) => void;
  onCategoryChange: (category: string) => void;
};

// Problem 筛选组件
export default function ProblemFilters({
  companies,
  difficulties,
  stages = ["All", "OA (线上测评/笔试)", "VO (技术轮面/Onsite)"],
  categories,
  selectedCompany,
  selectedDifficulty,
  selectedStage = "All",
  selectedCategory,
  onCompanyChange,
  onDifficultyChange,
  onStageChange,
  onCategoryChange,
}: ProblemFiltersProps) {
  return (
    <div className="space-y-6">

      {/* Company 筛选区域 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Company
        </p>

        <div className="flex flex-wrap gap-2">
          {companies.map((company) => (
            <button
              key={company}
              type="button"
              onClick={() => onCompanyChange(company)}
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${
                  selectedCompany === company
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty 筛选区域 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Difficulty
        </p>

        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              onClick={() => onDifficultyChange(difficulty)}
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${
                  selectedDifficulty === difficulty
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 Stage 筛选区域 (OA / VO) */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Stage (考核形式)
        </p>

        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => onStageChange && onStageChange(stage)}
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${
                  selectedStage === stage
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Category 筛选区域 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Category
        </p>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}