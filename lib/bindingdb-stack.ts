import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import rds = require('@aws-cdk/aws-rds');
import glue = require('@aws-cdk/aws-glue');
import s3 = require('@aws-cdk/aws-s3');
import s3assets = require('@aws-cdk/aws-s3-assets');
import { RDSdataSetSetEnrollmentProps, RDSOracleDataSetEnrollment } from './constructs/rds-data-set-enrollment';
import { DataSetStack, DataSetStackProps} from './stacks/dataset-stack';




export interface BindingDBEnrollmentProps extends DataSetStackProps {
	databaseSecret: rds.DatabaseSecret;
	database: rds.DatabaseInstance;
	accessSecurityGroup: ec2.SecurityGroup;
}

export class BindingDBStack extends DataSetStack{
	constructor(scope: cdk.Construct, id: string, props: BindingDBEnrollmentProps) {
		super(scope, id, props);
	
	
		const dataSetName = "binding_db";

		this.Enrollments.push(new RDSOracleDataSetEnrollment(this, 'binding-db-enrollment', {
	    	databaseSecret: props.databaseSecret,
	    	database: props.database,
	    	MaxDPUs: 5.0,
	    	databaseSidOrServiceName: "orcl",
	    	accessSecurityGroup: props.accessSecurityGroup,
	    	dataLakeBucket: props.DataLake.DataLakeBucket,
	    	DataSetName: dataSetName,
	    	JdbcTargetIncludePaths: ["orcl/%"],
	    	GlueScriptPath: "scripts/glue.s3import.bindingdb.py",
			GlueScriptArguments: {
				"--job-language": "python", 
				"--job-bookmark-option": "job-bookmark-disable",
				"--enable-metrics": "",
				"--DL_BUCKET": props.DataLake.DataLakeBucket.bucketName,
				"--DL_PREFIX": "/"+dataSetName+"/",
				"--DL_REGION": cdk.Stack.of(this).region,
				"--GLUE_SRC_DATABASE": "binding_db_src"
			}	    	
		}));
		
		
	}
}




