# -*- coding: utf-8 -*-
"""
  sellar_base.py generated by WhatsOpt. 
"""
# DO NOT EDIT unless you know what you are doing
# analysis_id: 1

import numpy as np
from openmdao.api import Problem, Group
from openmdao.api import IndepVarComp
from openmdao.api import NonlinearBlockGS, ScipyKrylov

from disc1 import Disc1
from disc2 import Disc2
from functions import Functions

class SellarBase(Group):
    """ An OpenMDAO base component to encapsulate Sellar MDA """
    
    def setup(self): 
    
    
        indeps = self.add_subsystem('indeps', IndepVarComp(), promotes=['*'])
		
        indeps.add_output('x', 2)
        indeps.add_output('z', [5., 2.])		    
 		
 		
        self.add_subsystem('Disc1', self.create_disc1(), promotes=['x', 'y1', 'y2', 'z'])
        self.add_subsystem('Disc2', self.create_disc2(), promotes=['z', 'y1', 'y2'])
        self.add_subsystem('Functions', self.create_functions(), promotes=['y2', 'y1', 'x', 'z', 'obj', 'g1', 'g2'])         

        self.nonlinear_solver = NonlinearBlockGS() 
        self.linear_solver = ScipyKrylov()

    
    def create_disc1(self):
    	return Disc1()
    
    def create_disc2(self):
    	return Disc2()
    
    def create_functions(self):
    	return Functions()
    