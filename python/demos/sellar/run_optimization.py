# -*- coding: utf-8 -*-
"""
  run_optimization.py generated by WhatsOpt. 
"""
# DO NOT EDIT unless you know what you are doing
# analysis_id: 1

import sys
import numpy as np
# import matplotlib
# matplotlib.use('Agg')
import matplotlib.pyplot as plt
from openmdao.api import Problem, SqliteRecorder, CaseReader, ScipyOptimizeDriver #, pyOptSparseDriver, SimpleGADriver
from sellar import Sellar 

from optparse import OptionParser
parser = OptionParser()
parser.add_option("-b", "--batch",
                  action="store_true", dest="batch", default=False,
                  help="do not plot anything")
(options, args) = parser.parse_args()

pb = Problem(Sellar())

pb.driver = ScipyOptimizeDriver()
pb.driver.options['optimizer'] = 'SLSQP'

pb.driver.options['tol'] = 1.0e-06

pb.driver.options['maxiter'] = 100

pb.driver.options['disp'] = True
pb.driver.options['debug_print'] = ['desvars','ln_cons','nl_cons','objs', 'totals']

case_recorder_filename = 'sellar_optimization.sqlite'
print(case_recorder_filename)        
recorder = SqliteRecorder(case_recorder_filename)
pb.driver.add_recorder(recorder)
pb.model.add_recorder(recorder)
pb.model.nonlinear_solver.add_recorder(recorder)

# Derivatives are compute via finite-difference method
# to be commnented out if partial derivatives are declared
pb.model.approx_totals(method='fd', step=1e-6, form='central')


pb.model.add_design_var('x', lower=0, upper=10)
pb.model.add_design_var('z', lower=0, upper=10)

pb.model.add_objective('obj')


pb.model.add_constraint('g1', upper=0.)
pb.model.add_constraint('g2', upper=0.)

pb.setup()  
pb.run_driver()      

if options.batch:
    exit(0)  
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
      
