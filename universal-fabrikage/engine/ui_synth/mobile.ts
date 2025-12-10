// Mobile UI Synthesizer (React Native / Flutter)
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';

export function emitMobile(plan: Plan, intent: Intent, framework: 'react-native' | 'flutter' = 'react-native'): { files: { path: string; content: string }[] } {
  if (framework === 'react-native') {
    return emitReactNative(plan, intent);
  } else {
    return emitFlutter(plan, intent);
  }
}

function emitReactNative(plan: Plan, intent: Intent): { files: { path: string; content: string }[] } {
  const appJs = `// Auto-generated React Native App: ${plan.category}
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function App() {
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState({});

  const calculate = () => {
    // Berechnungen
    const calculated = {};
    ${plan.nodes.map(node => {
      const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '');
      const args = node.formula.inputs.map(i => `inputs.${i.name.toLowerCase()}`).join(', ');
      const outputVar = node.formula.output.name.toLowerCase();
      return `    const ${outputVar} = ${funcName}(${args});
    calculated.${outputVar} = ${outputVar};`;
    }).join('\n    ')}
    setResults(calculated);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>${plan.category}</Text>
      ${plan.inputs.map(input => `
      <TextInput
        style={styles.input}
        placeholder="${input}"
        keyboardType="numeric"
        onChangeText={(text) => setInputs({...inputs, ${input.toLowerCase()}: parseFloat(text)})}
      />`).join('')}
      <Button title="Berechnen" onPress={calculate} />
      ${plan.outputs.map(output => `
      <Text style={styles.result}>${output}: {results.${output.toLowerCase()}}</Text>`).join('')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  result: { fontSize: 18, marginTop: 10 }
});`;

  const packageJson = JSON.stringify({
    name: plan.category.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    main: 'App.js',
    dependencies: {
      'react': '^18.0.0',
      'react-native': '^0.72.0'
    }
  }, null, 2);

  return {
    files: [
      { path: 'App.js', content: appJs },
      { path: 'package.json', content: packageJson }
    ]
  };
}

function emitFlutter(plan: Plan, intent: Intent): { files: { path: string; content: string }[] } {
  const mainDart = `// Auto-generated Flutter App: ${plan.category}
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${plan.category}',
      home: CalculatorScreen(),
    );
  }
}

class CalculatorScreen extends StatefulWidget {
  @override
  _CalculatorScreenState createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  final Map<String, TextEditingController> controllers = {
    ${plan.inputs.map(input => `'${input.toLowerCase()}': TextEditingController(),`).join('\n    ')}
  };
  Map<String, double> results = {};

  void calculate() {
    setState(() {
      ${plan.nodes.map(node => {
        const funcName = node.formula.name.toLowerCase().replace(/\s+/g, '_');
        const args = node.formula.inputs.map(i => `double.parse(controllers['${i.name.toLowerCase()}']!.text)`).join(', ');
        const outputVar = node.formula.output.name.toLowerCase();
        return `      results['${outputVar}'] = ${funcName}(${args});`;
      }).join('\n      ')}
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${plan.category}')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            ${plan.inputs.map(input => `
            TextField(
              controller: controllers['${input.toLowerCase()}'],
              decoration: InputDecoration(labelText: '${input}'),
              keyboardType: TextInputType.number,
            ),`).join('')}
            ElevatedButton(
              onPressed: calculate,
              child: Text('Berechnen'),
            ),
            ${plan.outputs.map(output => `
            Text('${output}: \${results['${output.toLowerCase()}'] ?? 0}'),`).join('')}
          ],
        ),
      ),
    );
  }
}`;

  const pubspecYaml = `name: ${plan.category.toLowerCase().replace(/\s+/g, '_')}
description: Auto-generated Flutter app
version: 1.0.0
environment:
  sdk: '>=2.17.0 <4.0.0'
dependencies:
  flutter:
    sdk: flutter`;

  return {
    files: [
      { path: 'lib/main.dart', content: mainDart },
      { path: 'pubspec.yaml', content: pubspecYaml }
    ]
  };
}

module.exports = { emitMobile };


