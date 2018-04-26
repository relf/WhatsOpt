# -*- coding: utf-8 -*-
"""
  run_optimization.py generated by WhatsOpt. 
"""
# DO NOT EDIT unless you know what you are doing
# analysis_id: 44

import sys
import numpy as np
import matplotlib.pyplot as plt
from openmdao.api import Problem, SqliteRecorder, CaseReader, ScipyOptimizer
from sellar import Sellar

pb = Problem(Sellar())
pb.driver = ScipyOptimizer()
pb.driver.options['optimizer'] = 'SLSQP'
pb.driver.options['tol'] = 1e-9
pb.driver.options['disp'] = True

case_recorder_filename = 'sellar_optimization.sqlite'        
recorder = SqliteRecorder(case_recorder_filename)
pb.driver.add_recorder(recorder)
pb.model.add_recorder(recorder)
pb.model.nonlinear_solver.add_recorder(recorder)


pb.model.add_design_var('x', lower=0, upper=10)
pb.model.add_design_var('z', lower=0, upper=10)

pb.model.add_objective('obj')


pb.setup()  
pb.run_driver()        
reader = CaseReader(case_recorder_filename)
cases = reader.system_cases.list_cases()
n = len(cases)
data = {'inputs': {}, 'outputs': {} }

data['inputs']['x'] = np.zeros((n,)+(1,))
data['inputs']['z'] = np.zeros((n,)+(2,))

data['outputs']['obj'] = np.zeros((n,)+(1,))
data['outputs']['g1'] = np.zeros((n,)+(1,))
data['outputs']['g2'] = np.zeros((n,)+(1,))

for i, case_id in enumerate(cases):
    case = reader.system_cases.get_case(case_id)

    data['inputs']['x'][i,:] = case.inputs['x']

    data['inputs']['z'][i,:] = case.inputs['z']


    data['outputs']['obj'][i,:] = case.outputs['obj']

    data['outputs']['g1'][i,:] = case.outputs['g1']

    data['outputs']['g2'][i,:] = case.outputs['g2']

      
