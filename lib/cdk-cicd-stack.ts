import * as cdk from 'aws-cdk-lib/core';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { PipelineStage } from './PipelineStage';

export class CdkCicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'AwesomePipeline', {
      pipelineName: 'AwesomePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('kishanshetty1991/aws_cicd_pipeline', 'cicd-practice', {
          authentication: cdk.SecretValue.secretsManager(
            'github-token',
            { jsonField: 'github-token' }
          )
        }),
        commands: [
          'npm ci',
          'npx cdk synth',
        ],
      })
    });

    const testStage = pipeline.addStage(new PipelineStage(this, 'PipelineStage', {
      stageName: 'test'
    }));

    testStage.addPre( new CodeBuildStep('unit-tests',{
      commands: [
        'npm ci',
        'npm test'
      ]
    }) )
  }
}
