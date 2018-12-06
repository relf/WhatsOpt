require 'test_helper'

class Api::V1::AnalysisDisciplinesControllerTest < ActionDispatch::IntegrationTest
  setup do
    user1 = users(:user1)
    sign_in user1
    @auth_headers = {"Authorization" => "Token " + TEST_API_KEY}
    @outermda = analyses(:outermda)
    @innermda = analyses(:innermda)
    @cicav = analyses(:cicav)
    @innermdadisc = disciplines(:outermda_innermda_discipline)
    @vacantdisc = disciplines(:outermda_vacant_discipline)
  end

  test "should create an analysis discipline from a given analysis" do
    assert_difference('AnalysisDiscipline.count') do
      assert_difference('Discipline.count') do
        post api_v1_mda_discipline_url(@outermda), params: { analysis_discipline: {analysis_id: @cicav.id }}, 
          as: :json, headers: @auth_headers
        assert_response :success
      end
    end
  end
  
  test "should create an analysis discipline from a given discipline and an analysis" do
    assert_equal [], @outermda.driver.output_variables.map(&:name).sort 
    assert_equal [], @vacantdisc.output_variables.map(&:name).sort 
    assert_difference('AnalysisDiscipline.count') do
      post api_v1_discipline_mda_url(@vacantdisc), params: { analysis_discipline: {analysis_id: @cicav.id }}, 
        as: :json, headers: @auth_headers
      assert_response :success
    end
    # should create projected variables and connection in outermda 
    # outer Driver output names = inner Driver output names
    expected_out_varnames = @cicav.driver.output_variables.map(&:name).sort
    assert_equal expected_out_varnames, @cicav.driver.output_variables.map(&:name).sort 
    # outer Discipline input names = inner Driver output names
    assert_equal expected_out_varnames, @vacantdisc.input_variables.map(&:name).sort 
    # check connections are created
    assert_equal 2, Connection.between(@outermda.driver.id, @vacantdisc.id).count
  end

  test "should delete an mda discipline" do
    assert_difference('AnalysisDiscipline.count', -1) do
      delete api_v1_discipline_mda_url(@innermdadisc), as: :json, headers: @auth_headers
      assert_response :success
    end
  end

end