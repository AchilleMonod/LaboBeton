import ConcreteTest from '../models/ConcreteTest.js';
import mongoose from 'mongoose';
import sanitize from 'sanitize-html';

/**
 * @desc    Récupérer tous les essais béton
 * @route   GET /api/concrete-tests
 * @access  Private
 */
const getConcreteTests = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }
    const tests = await ConcreteTest.find({ userId: new mongoose.Types.ObjectId(req.user.id) })
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
    
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    // Nettoyage et validation des éprouvettes (specimens)
    const cleanSpecimens = Array.isArray(input.specimens) ? input.specimens.map(s => ({
        number: Number(s.number),
        age: Number(s.age),
        castingDate: s.castingDate,
        crushingDate: s.crushingDate,
        specimenType: sanitize(String(s.specimenType || '')),
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
      userId: new mongoose.Types.ObjectId(req.user.id),
      projectId: sanitize(String(input.projectId)),
      projectName: sanitize(String(input.projectName || '')),
      companyName: sanitize(String(input.companyName || '')),
      moe: sanitize(String(input.moe || '')),
      moa: sanitize(String(input.moa || '')),
      structureName: sanitize(String(input.structureName || '')),
      elementName: sanitize(String(input.elementName || '')),
      receptionDate: input.receptionDate,
      samplingDate: input.samplingDate,
      volume: Number(input.volume || 0),
      concreteClass: sanitize(String(input.concreteClass || '')),
      mixType: sanitize(String(input.mixType || '')),
      formulaInfo: sanitize(String(input.formulaInfo || '')),
      manufacturer: sanitize(String(input.manufacturer || '')),
      manufacturingPlace: sanitize(String(input.manufacturingPlace || '')),
      deliveryMethod: sanitize(String(input.deliveryMethod || '')),
      slump: Number(input.slump || 0),
      samplingPlace: sanitize(String(input.samplingPlace || '')),
      externalTemp: Number(input.externalTemp || 0),
      concreteTemp: Number(input.concreteTemp || 0),
      tightening: sanitize(String(input.tightening || '')),
      vibrationTime: Number(input.vibrationTime || 0),
      layers: Number(input.layers || 0),
      curing: sanitize(String(input.curing || '')),
      testType: sanitize(String(input.testType || '')),
      standard: sanitize(String(input.standard || '')),
      preparation: sanitize(String(input.preparation || '')),
      pressMachine: sanitize(String(input.pressMachine || '')),
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("ID de rapport d'essai invalide.");
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    const test = await ConcreteTest.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.user.id)
    });

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
            if (typeof test[field] === 'number') {
                test[field] = Number(input[field]);
            } else {
                test[field] = sanitize(String(input[field]));
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
            specimenType: sanitize(String(s.specimenType || '')),
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("ID de rapport d'essai invalide.");
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400);
        throw new Error("ID utilisateur invalide.");
    }

    const deleted = await ConcreteTest.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.user.id)
    });

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

