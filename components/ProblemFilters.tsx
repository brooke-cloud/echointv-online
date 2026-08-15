type ProblemFiltersProps = {
  companies: string[];
  difficulties: string[];
  categories: string[];

  selectedCompany: string;
  selectedDifficulty: string;
  selectedCategory: string;

  onCompanyChange: (
    company: string
  ) => void;

  onDifficultyChange: (
    difficulty: string
  ) => void;

  onCategoryChange: (
    category: string
  ) => void;
};

// Problem 筛选组件
export default function ProblemFilters({
  companies,
  difficulties,
  categories,
  selectedCompany,
  selectedDifficulty,
  selectedCategory,
  onCompanyChange,
  onDifficultyChange,
  onCategoryChange,
}: ProblemFiltersProps) {
  return (
    <div className="space-y-6">

      {/* Company 筛选区域 */}
      <div>

        {/* Company 标题 */}
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Company
        </p>

        {/* Company 按钮列表 */}
        <div className="flex flex-wrap gap-2">

          {companies.map((company) => (
            <button
              key={company}
              type="button"
              onClick={() =>
                onCompanyChange(company)
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition
                ${
                  selectedCompany === company
                    ? "bg-blue-600 text-white"
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

        {/* Difficulty 标题 */}
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Difficulty
        </p>

        {/* Difficulty 按钮列表 */}
        <div className="flex flex-wrap gap-2">

          {difficulties.map(
            (difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() =>
                  onDifficultyChange(
                    difficulty
                  )
                }
                className={`
                  rounded-lg
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition
                  ${
                    selectedDifficulty ===
                    difficulty
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }
                `}
              >
                {difficulty}
              </button>
            )
          )}

        </div>

      </div>


      {/* Category 筛选区域 */}
      <div>

        {/* Category 标题 */}
        <p className="mb-3 text-sm font-semibold text-gray-700">
          Category
        </p>

        {/* Category 按钮列表 */}
        <div className="flex flex-wrap gap-2">

          {categories.map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  onCategoryChange(
                    category
                  )
                }
                className={`
                  rounded-lg
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition
                  ${
                    selectedCategory ===
                    category
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }
                `}
              >
                {category}
              </button>
            )
          )}

        </div>

      </div>

    </div>
  );
}