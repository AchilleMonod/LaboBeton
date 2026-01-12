import ConcreteTest from '../models/ConcreteTest.js';

/**
 * @desc    Récupérer tous les essais béton
 * @route   GET /api/concrete-tests
 * @access  Private
 */
const getConcreteTests = async (req, res) => {
    const tests = await ConcreteTest.find({ userId: req.user.id })
      .sort({ sequenceNumber: -1 })
      .populate('projectId', 'name')
      .lean();
    res.json(tests);
};

/**
 * @desc    Créer un nouvel essai béton
 * @route   POST /api/concrete-tests
 * @access  Private
 */
const createConcreteTest = async (req, res) => {
    const input = req.body;
    
    // Nettoyage et validation des éprouvettes (specimens)
    const cleanSpecimens = Array.isArray(input.specimens) ? input.specimens.map(s => ({
        number: Number(s.number),
        age: Number(s.age),
        castingDate: s.castingDate,
        crushingDate: s.crushingDate,
        specimenType: String(s.specimenType || ''),
        diameter: Number(s.diameter),
        height: Number(s.height),
        surface: Number(s.surface),
        weight: s.weight ? Number(s.weight) : null,
        force: s.force ? Number(s.force) : null,
        stress: s.stress ? Number(s.stress) : null,
        density: s.density ? Number(s.density) : null
    })) : [];

    // Construction explicite pour éviter l'injection de champs non désirés
    const newTest = new ConcreteTest({
      userId: req.user.id,
      projectId: String(input.projectId),
      projectName: String(input.projectName || ''),
      companyName: String(input.companyName || ''),
      moe: String(input.moe || ''),
      moa: String(input.moa || ''),
      structureName: String(input.structureName || ''),
      elementName: String(input.elementName || ''),
      receptionDate: input.receptionDate,
      samplingDate: input.samplingDate,
      volume: Number(input.volume || 0),
      concreteClass: String(input.concreteClass || ''),
      mixType: String(input.mixType || ''),
      formulaInfo: String(input.formulaInfo || ''),
      manufacturer: String(input.manufacturer || ''),
      manufacturingPlace: String(input.manufacturingPlace || ''),
      deliveryMethod: String(input.deliveryMethod || ''),
      slump: Number(input.slump || 0),
      samplingPlace: String(input.samplingPlace || ''),
      externalTemp: Number(input.externalTemp || 0),
      concreteTemp: Number(input.concreteTemp || 0),
      tightening: String(input.tightening || ''),
      vibrationTime: Number(input.vibrationTime || 0),
      layers: Number(input.layers || 0),
      curing: String(input.curing || ''),
      testType: String(input.testType || ''),
      standard: String(input.standard || ''),
      preparation: String(input.preparation || ''),
      pressMachine: String(input.pressMachine || ''),
      specimens: cleanSpecimens
    });

    const createdTest = await newTest.save();
    res.status(201).json(createdTest);
};

/**
 * @desc    Mettre à jour un essai béton
 * @route   PUT /api/concrete-tests/:id
 * @access  Private
 */
const updateConcreteTest = async (req, res) => {
    const test = await ConcreteTest.findOne({ _id: req.params.id, userId: req.user.id });

    if (!test) {
        res.status(404);
        throw new Error("Rapport d'essai non trouvé ou accès non autorisé.");
    }

    const input = req.body;
    
    // Assignation des champs autorisés
    const allowedFields = [
        'structureName', 'elementName', 'receptionDate', 'samplingDate', 
        'volume', 'concreteClass', 'mixType', 'formulaInfo', 'manufacturer', 
        'manufacturingPlace', 'deliveryMethod', 'slump', 'samplingPlace', 
        'tightening', 'vibrationTime', 'layers', 'curing', 'testType', 
        'standard', 'preparation', 'pressMachine', 'externalTemp', 'concreteTemp'
    ];

    allowedFields.forEach(field => {
        if (input[field] !== undefined) {
            // Utiliser un Number() ou String() selon le type attendu si nécessaire
            if (typeof test[field] === 'number') {
                test[field] = Number(input[field]);
            } else {
                test[field] = String(input[field]);
            }
        }
    });
     if (input.receptionDate !== undefined) test.receptionDate = input.receptionDate;
     if (input.samplingDate !== undefined) test.samplingDate = input.samplingDate;

    // Gestion spécifique du tableau d'éprouvettes
    if (Array.isArray(input.specimens)) {
        test.specimens = input.specimens.map(s => ({
            _id: s._id, // Conserve l'ID pour la mise à jour des sous-documents
            number: Number(s.number),
            age: Number(s.age),
            castingDate: s.castingDate,
            crushingDate: s.crushingDate,
            specimenType: String(s.specimenType || ''),
            diameter: Number(s.diameter),
            height: Number(s.height),
            surface: Number(s.surface),
            weight: s.weight ? Number(s.weight) : null,
            force: s.force ? Number(s.force) : null,
            stress: s.stress ? Number(s.stress) : null,
            density: s.density ? Number(s.density) : null
        }));
    }

    const updatedTest = await test.save();
    
    res.json(updatedTest);
};

/**
 * @desc    Supprimer un essai béton
 * @route   DELETE /api/concrete-tests/:id
 * @access  Private
 */
const deleteConcreteTest = async (req, res) => {
    const deleted = await ConcreteTest.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) {
        res.status(404);
        throw new Error("Rapport d'essai non trouvé ou accès non autorisé.");
    }
    res.json({ message: "Le rapport d'essai a été supprimé." });
};

export {
    getConcreteTests,
    createConcreteTest,
    updateConcreteTest,
    deleteConcreteTest
};
