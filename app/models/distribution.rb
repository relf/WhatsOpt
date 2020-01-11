class Distribution < ApplicationRecord

  DISTRIBUTIONS = %w(Normal Beta Gamma Uniform)

  belongs_to :variable

  has_many :options, as: :optionizable
  accepts_nested_attributes_for :options, reject_if: proc { |attr| attr["name"].blank? }, allow_destroy: true 

  validates :kind, presence: true, allow_blank: false

  def nullified?
    kind.blank?
  end
end
