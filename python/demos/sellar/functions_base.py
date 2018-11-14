# -*- coding: utf-8 -*-
"""
  functions_base.py generated by WhatsOpt. 
"""
# DO NOT EDIT unless you know what you are doing
# analysis_id: 1

import numpy as np
from openmdao.api import ExplicitComponent

class FunctionsBase(ExplicitComponent):
    """ An OpenMDAO base component to encapsulate Functions discipline """

    
    def setup(self):
		
        self.add_input('y2', val=1.0, desc='disc2 state')
        self.add_input('y1', val=1.0, desc='disc1 state')
        self.add_input('x', val=1.0, desc='disc1 local variable')
        self.add_input('z', val=np.ones((2,)), desc='global variable')
		
        self.add_output('obj', val=1.0, desc='objective')
        self.add_output('g1', val=1.0, desc='constraint')
        self.add_output('g2', val=1.0, desc='constraint')
	

        