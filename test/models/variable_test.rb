require 'test_helper'

class VariableTest < ActiveSupport::TestCase
  
  test "should have shape and type default attributes resp 1 and Float" do
    var = Variable.new(name: 'test', io_mode: Variable::IN)
    assert_equal Variable::DEFAULT_SHAPE, var.shape
    assert_equal Variable::DEFAULT_TYPE, var.type
  end

  test "should be invalid if bad-formed shape" do
    var = Variable.new(name: 'test', io_mode: Variable::IN, shape:'shape')
    refute var.valid?
  end
  
  test "should be valid if well-formed shape and have the right dim" do
    var = Variable.new(name: 'test', io_mode: Variable::IN, shape:'3')
    assert var.valid?
    assert_equal 3, var.dim
    var = Variable.new(name: 'test', io_mode: Variable::IN, shape:'(12,)')
    assert var.valid?
    assert_equal 12, var.dim
    var = Variable.new(name: 'test', io_mode: Variable::IN, shape:'(5,6)')
    assert var.valid?
    assert_equal 5*6, var.dim
  end

end
