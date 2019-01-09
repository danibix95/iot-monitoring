# MLBlock

This folder contains the project component related to the custom Node-Red block. This block allow to load pre-trained machine learning or deep learning models and apply them on each message that is received in input. In particular the block can manage Tensorflow (Keras format) and Scikit-learn pre-trained models.

# Requirements
In order to install this block it is necessary to have the following software installed on your system:
- python ^3.6
- scikit-learn ^0.19.2
- numpy ^1.15.1
- tensorflow ^1.12.0
- nodejs ^10.0.0
- node-red ^0.19.5

# Installation
To install this node and make it available for Node-Red it is necessary to run the instruction displayed below.
    
    # open a terminal in the location where node-red has been installed
    cd $HOME/.node-red
    # install the package from its local folder
    npm install <ml-block-folder-path>

# Usage
### Node configuration
This block has three attributes that has to be configured in order to work properly:
- **the Model Type:** this value is employed to select which is the format of pre-trained ML model that should be loaded
- **the Model URL:** this value indicate the URL where the model is located
- **the Model Loader [Python]:** this value is specific to the SciKit-learn model type, since it represent the location of the script that will load saved model and execute it in Python.

### Input and Output Messages
The block takes in input a message with a specific structure and output the same message with a new field added.

Below it is possible to observe an example of input message:

    msg.payload = {
      /* the values retrieved from sensors */
      values = [[730], [24], [35], [40]];
      /* the shape of input data (e.g 1-D / 2-D vector, ...) */ 
      shape = [1,4,1];
    }

Similarly, the output message will contain all the field of input message, but it also provide in the `prediction` field the outcome of the ML model for that particular input.
**Note:** the type of the `prediction` field depends on the pre-trained model that has been feed to the ML-block.
   