# frozen_string_literal: true

class AnalysisPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.admin?
        scope.roots
      else
        scope.roots.select do |record|
          if user.analyses_query == "mine"
            user.has_role?(:owner, record)
          else
            record.public || user.has_role?(:owner, record) || user.has_role?(:member, record)
          end
        end
      end
    end
  end

  def create?
    true
  end

  def show?
    @record.public || @user.admin? || @user.has_role?(:owner, @record) || @user.has_role?(:member, @record)
  end

  def operate?
    APP_CONFIG['enable_remote_operations'] && update?
  end

  def edit?
    update?
  end

  def update?
    @user.admin? || @user.has_role?(:owner, @record)
  end

  def destroy?
    @user.admin? || @user.has_role?(:owner, @record)
  end
end
